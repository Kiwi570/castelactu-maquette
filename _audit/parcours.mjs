/* Parcours propres à Castel Actu : fil filtré (rubrique, commune, recherche sans accent ni pluriel),
   filtre par statut de la rubrique, formulaire « Alertez-nous » en 4 étapes (erreurs, double envoi, récapitulatif),
   lien prérempli depuis une brève, compte à rebours des 10 ans et jalons datés. */
export default async function ({ contexte, attendrePret, attendre, BASE, R, T }) {
  const compter = (page, sel) => page.evaluate((s) => [...document.querySelectorAll(s)].filter((c) => !c.hidden && getComputedStyle(c).display !== 'none').length, sel);

  /* 1. Fil de l'accueil. */
  {
    const { ctx, page } = await contexte({ taille: T('1366×768') });
    const lieu = { page: '/', taille: '1366×768' };
    try {
      await page.goto(BASE + '/', { waitUntil: 'load' });
      await attendrePret(page);
      const attendu = await page.evaluate(() => document.querySelectorAll('#fil [data-breve][data-rubrique="travaux"]').length);
      await page.click('#fil [data-filtre="rubrique"][data-valeur="travaux"]');
      await attendre(800);
      const vus = await compter(page, '#fil [data-breve]');
      if (vus !== attendu) R.echec('fil : filtre rubrique', `${vus} cartes visibles au lieu de ${attendu}`, lieu);
      if (!/rubrique=travaux/.test(page.url())) R.echec('fil : filtre rubrique', 'le filtre n’est pas gardé dans l’adresse', lieu);
      const texte = await page.textContent('[data-fil-resultat]');
      if (!texte.includes(String(attendu))) R.echec('fil : nombre de résultats', `« ${texte} » au lieu de ${attendu}`, lieu);
      /* Recherche : sans accent, au pluriel. */
      await page.click('#fil [data-filtre="rubrique"][data-valeur=""]');
      await page.fill('#fil-q', 'PISCINES');
      await attendre(900);
      const piscine = await compter(page, '#fil [data-breve]');
      if (piscine !== 1) R.echec('fil : recherche', `« PISCINES » donne ${piscine} résultats au lieu de 1`, lieu);
      await page.fill('#fil-q', 'chateau');
      await attendre(900);
      const chateau = await compter(page, '#fil [data-breve]');
      if (chateau < 2) R.echec('fil : recherche sans accent', `« chateau » donne ${chateau} résultat(s)`, lieu);
      /* Adresse partagée : le fil arrive filtré. */
      await page.goto(BASE + '/?commune=treffieux#fil', { waitUntil: 'load' });
      await attendrePret(page);
      const tref = await compter(page, '#fil [data-breve]');
      if (tref !== 1) R.echec('fil : adresse partagée', `?commune=treffieux affiche ${tref} cartes au lieu de 1`, lieu);
      R.ok('fil filtrable');
    } finally { await ctx.close(); }
  }

  /* 2. Rubrique : filtre par statut. */
  {
    const { ctx, page } = await contexte({ taille: T('390×844') });
    const lieu = { page: '/rubriques/travaux-et-projets', taille: '390×844' };
    try {
      await page.goto(BASE + '/rubriques/travaux-et-projets', { waitUntil: 'load' });
      await attendrePret(page);
      await page.locator('#liste [data-filtre="statut"][data-valeur="annule"]').scrollIntoViewIfNeeded();
      await page.click('#liste [data-filtre="statut"][data-valeur="annule"]');
      await attendre(800);
      const n = await compter(page, '#liste [data-breve]');
      if (n !== 1) R.echec('rubrique : filtre statut', `${n} cartes pour « Projet annulé » au lieu de 1`, lieu);
      R.ok('rubrique filtrable');
    } finally { await ctx.close(); }
  }

  /* 3. Alertez-nous : étapes, erreurs, récapitulatif, envoi simulé sans double envoi ; lien prérempli. */
  {
    const { ctx, page } = await contexte({ taille: T('390×844') });
    const lieu = { page: '/alertez-nous', taille: '390×844' };
    try {
      await page.goto(BASE + '/alertez-nous?type=video&rubrique=travaux&sujet=central-8#formulaire', { waitUntil: 'load' });
      await attendrePret(page);
      const pre = await page.evaluate(() => ({ type: document.querySelector('[name="type"]:checked')?.value, rubrique: document.querySelector('#f-rubrique').value, rappel: !document.querySelector('[data-sujet-rappel]').hidden }));
      if (pre.type !== 'video' || pre.rubrique !== 'travaux') R.echec('formulaire prérempli', `type ${pre.type}, rubrique ${pre.rubrique}`, lieu);
      if (!pre.rappel) R.echec('formulaire prérempli', 'le sujet d’origine (Central 8) n’est pas rappelé', lieu);
      await page.click('[data-etape-suivante]');
      await attendre(500);
      await page.click('[data-etape-suivante]');
      await attendre(400);
      const erreur = await page.evaluate(() => !!document.querySelector('#f-commune[aria-invalid="true"]'));
      if (!erreur) R.echec('formulaire : vérification', 'l’étape 2 passe sans commune', lieu);
      await page.selectOption('#f-commune', 'soudan');
      await page.click('[data-etape-suivante]');
      await attendre(400);
      await page.fill('#f-titre', 'Essai de l’audit');
      await page.fill('#f-description', 'Description de test.');
      await page.click('[data-etape-suivante]');
      await attendre(400);
      await page.fill('#f-prenom', 'Audit');
      await page.fill('#f-email', 'pas-un-email');
      await page.check('#f-accord');
      await page.click('[data-etape-envoyer]');
      await attendre(300);
      const mauvais = await page.evaluate(() => document.querySelector('#f-email').getAttribute('aria-invalid') === 'true');
      if (!mauvais) R.echec('formulaire : e-mail', 'une adresse invalide est acceptée', lieu);
      await page.fill('#f-email', 'audit@exemple.fr');
      const recap = await page.textContent('[data-recap-champ="commune,lieu"]');
      if (!/Soudan/.test(recap)) R.echec('formulaire : récapitulatif', `« ${recap} » au lieu de Soudan`, lieu);
      await page.click('[data-etape-envoyer]');
      await attendre(300);
      const fin = await page.evaluate(() => ({ message: !document.querySelector('[data-message-envoi]').hidden, bloque: document.querySelector('[data-etape-envoyer]').disabled }));
      if (!fin.message) R.echec('formulaire : envoi simulé', 'aucun message après l’envoi', lieu);
      if (!fin.bloque) R.echec('formulaire : double envoi', 'le bouton reste actif après l’envoi', lieu);
      R.ok('formulaire en étapes');
    } finally { await ctx.close(); }
  }

  /* 4. Compte à rebours des 10 ans et jalons, calculés à la date du jour (heure de Paris). */
  {
    const { ctx, page } = await contexte({ taille: T('1366×768') });
    try {
      await page.goto(BASE + '/', { waitUntil: 'load' });
      await attendrePret(page);
      const r = await page.evaluate(() => {
        const j = (d) => Math.round(Date.parse(new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d) + 'T00:00:00Z') / 86400000);
        const el = document.querySelector('[data-compte-a-rebours]');
        const n = j(new Date(el.dataset.compteARebours)) - j(new Date());
        return { n, affiche: el.querySelector('[data-compte-chiffre]').textContent };
      });
      if (r.n > 0 && !r.affiche.includes(String(r.n))) R.echec('compte à rebours', `affiche « ${r.affiche} » au lieu de J−${r.n}`, { page: '/' });
      await page.goto(BASE + '/qui-sommes-nous', { waitUntil: 'load' });
      await attendrePret(page);
      const passe = await page.evaluate(() => document.querySelector('[data-jalon="2016-11-13"]').classList.contains('jalon--passe'));
      if (!passe) R.echec('jalons datés', 'le 13 novembre 2016 n’est pas marqué comme passé', { page: '/qui-sommes-nous' });
      R.ok('dates calculées');
    } finally { await ctx.close(); }
  }
}
