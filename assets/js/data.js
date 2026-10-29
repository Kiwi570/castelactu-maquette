// Données de la maquette Castel Actu — un seul fichier à tenir à jour.
// Tout vient du site actuel (castelactu.wixsite.com/castelactu). Ce qui manque vaut null et s'affiche « à compléter ».

const FB = 'https://www.facebook.com/CastelActu/posts/';

export const SITE = {
  nom: 'Castel Actu',
  accroche: 'L’info 24/24 du Pays de Châteaubriant depuis 2016',
  naissance: '2016-11-13',
  association: '2026-01-21',
  adresse: '17 rue d’Ancenis, 44110 Châteaubriant',
  tel: '06 99 59 99 75',
  telLien: '+33699599975',
  email: 'contact@castelactu.fr',
  facebook: 'https://www.facebook.com/CastelActu/',
  directeur: 'Gaetan Lassalle',
  siret: '100 220 995 00011',
  rna: 'W441007944',
  carburants: 'https://mon-essence.fr/ville/27525-chateaubriant',
  youtube: null, // lien de la chaîne à compléter
};

// Audience affichée sur le site actuel (date du relevé à compléter).
export const AUDIENCE = [
  { valeur: 1.7, decimales: 1, suffixe: ' M', libelle: 'vues par mois', source: 'Facebook, moyenne sur 28 jours' },
  { valeur: 200000, decimales: 0, prefixe: '+', libelle: 'lecteurs par mois', source: 'Chiffre affiché sur le site actuel' },
  { valeur: 11, decimales: 0, libelle: 'communes suivies', source: 'Pays de Châteaubriant' },
  { valeur: 2016, decimales: 0, libelle: 'depuis le 13 novembre', source: 'Création de la page Facebook', annee: true },
];

// Alerte en cours : null = « Pas d’alerte actuellement ».
export const ALERTE = null;

// Coordonnées approximatives (carte schématique).
export const COMMUNES = [
  { id: 'chateaubriant', nom: 'Châteaubriant', lat: 47.7167, lon: -1.3764, centre: true },
  { id: 'erbray', nom: 'Erbray', lat: 47.655, lon: -1.3156 },
  { id: 'soudan', nom: 'Soudan', lat: 47.7333, lon: -1.3064 },
  { id: 'ferce', nom: 'Fercé', lat: 47.8, lon: -1.4167 },
  { id: 'rouge', nom: 'Rougé', lat: 47.7836, lon: -1.4478 },
  { id: 'louisfert', nom: 'Louisfert', lat: 47.6761, lon: -1.4339 },
  { id: 'ruffigne', nom: 'Ruffigné', lat: 47.7614, lon: -1.5103 },
  { id: 'villepot', nom: 'Villepot', lat: 47.78, lon: -1.2869 },
  { id: 'soulvache', nom: 'Soulvache', lat: 47.8389, lon: -1.4767 },
  { id: 'isse', nom: 'Issé', lat: 47.6236, lon: -1.45 },
  { id: 'treffieux', nom: 'Treffieux', lat: 47.6203, lon: -1.5386 },
];

// Rubriques du site actuel (+ « Vie municipale », proposée).
export const RUBRIQUES = [
  { id: 'commerce', nom: 'Commerce' },
  { id: 'travaux', nom: 'Travaux' },
  { id: 'economie', nom: 'Économie' },
  { id: 'faits-divers', nom: 'Faits divers' },
  { id: 'association', nom: 'Association' },
  { id: 'sport', nom: 'Sport' },
  { id: 'loisirs', nom: 'Loisirs' },
  { id: 'culture', nom: 'Culture' },
  { id: 'cinema', nom: 'Cinéma' },
  { id: 'transport', nom: 'Transport' },
  { id: 'vie-municipale', nom: 'Vie municipale' },
  { id: 'meteo', nom: 'Météo' },
  { id: 'divers', nom: 'Divers' },
];

// image : chemin sans suffixe ; ia : image générée par IA (mention obligatoire) ; credit : source à afficher.
// tampon : mot du site actuel ; echeance.fin : date limite pour basculer en « échéance passée ».
export const ARTICLES = [
  {
    id: 'central-8', titre: 'Central 8, nouveau complexe de loisirs', rubrique: 'loisirs', communes: ['chateaubriant'],
    resume: 'Bowling, laser, trampoline et arcade : Central 8 s’installe au 10 avenue Jean Moulin. Ouverture annoncée au printemps 2026.',
    image: 'img/articles/central-8', cadrage: 'contain', fond: '#000000', ia: false, credit: 'Logo : Central 8', vues: 103295, une: true, chantier: true,
    tampon: 'Ouverture annoncée', echeance: { quoi: 'Ouverture annoncée', libelle: 'le printemps 2026', fin: '2026-06-20' },
    infos: [['Adresse', '10 avenue Jean Moulin, Châteaubriant'], ['Activités', 'Bowling, laser, trampoline, arcade'], ['Ouverture annoncée', 'Printemps 2026'], ['Site', 'central8.fr', 'https://central8.fr']],
    texte: ['Un nouveau complexe de loisirs prend place au 10 avenue Jean Moulin, à Châteaubriant : bowling, laser, trampoline et arcade sous un même toit.', 'L’ouverture était annoncée pour le printemps 2026. Plus d’infos sur central8.fr.'],
    fb: FB + 'pfbid02wukghx9Uchhcfv1aoY7bbJCfAcV26KhjLkPYjTVsjXaYQ6a8dFZqeTxvCL6J2LJWl',
  },
  {
    id: 'le-smash', titre: 'Le Smas’h, complexe sportif en construction', rubrique: 'sport', communes: ['chateaubriant'],
    resume: 'Padel, badminton et pickleball au 16 avenue du Président Wilson. Ouverture annoncée en août 2026.',
    image: 'img/articles/le-smash', ia: true, vues: 56640, chantier: true,
    tampon: 'En construction', echeance: { quoi: 'Ouverture annoncée', libelle: 'août 2026', fin: '2026-08-31' },
    infos: [['Adresse', '16 avenue du Président Wilson, Châteaubriant'], ['Activités', 'Padel, badminton, pickleball'], ['Ouverture annoncée', 'Août 2026']],
    fb: FB + 'pfbid0215mpmS8nWje72c7aVjGTUEi9G7GXtU6MzVXjhi3QsorEd7CVk12gunv4uFsdgdzul',
  },
  {
    id: 'credit-mutuel', titre: 'Le nouveau Crédit Mutuel prend forme zone Horizon', rubrique: 'economie', communes: ['chateaubriant'],
    resume: 'Construction de la nouvelle banque rue du Président Kennedy, en zone Horizon. Ouverture annoncée courant 2026.',
    image: 'img/articles/credit-mutuel', ia: true, vues: 35441, chantier: true,
    tampon: 'En construction', echeance: { quoi: 'Ouverture annoncée', libelle: 'courant 2026', fin: '2026-12-31' },
    infos: [['Lieu', 'Rue du Président Kennedy, zone Horizon'], ['Ouverture annoncée', 'Courant 2026']],
    fb: FB + 'pfbid0DgcFxuikbJHJMZFaB6vxLykpkNiBLXuPWeKwe41xmxLDv9B5tVLL3Eia1oyXtMfKl',
  },
  {
    id: 'espace-commercial', titre: 'Une nouvelle zone commerciale rue du 8 Mai 1945', rubrique: 'commerce', communes: ['chateaubriant'],
    resume: 'À proximité du Burger King : plusieurs magasins et 90 places de parking.',
    image: 'img/articles/espace-commercial', ia: true, vues: null, chantier: true, tampon: 'En construction',
    infos: [['Lieu', 'Rue du 8 Mai 1945, près du Burger King'], ['Stationnement', '90 places de parking']],
    fb: FB + 'pfbid094Aq2kaifFJn6xyEkS6c33ZtoAp4Cg6fbzJurwDoyyJFSRG8FSqk5dLQUxRcW3bGl',
  },
  {
    id: 'quartier-ville-marie', titre: 'Le nouveau quartier La Ville Marie sort de terre', rubrique: 'travaux', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/quartier-ville-marie', ia: false, credit: 'Source à compléter', vues: null, chantier: true, tampon: 'Sort de terre',
    fb: FB + 'pfbid02nkmsWadEtFkcwtHgpfjwtAtKjjYW9U91nkNwhdwMhhpVp1cnhewxjKdgX2qS5L6il',
  },
  {
    id: 'bijouterie-camille', titre: 'La Bijouterie de Camille a ouvert zone Horizon', rubrique: 'commerce', communes: ['chateaubriant'],
    resume: 'Une sélection de bijoux au 1 rue du Président Kennedy, ouverte depuis le 3 février 2026.',
    image: 'img/articles/bijouterie-camille', ia: false, credit: 'Photo : Castel Actu', vues: null, tampon: 'Ouvert',
    infos: [['Adresse', '1 rue du Président Kennedy, Châteaubriant'], ['Ouverture', 'Depuis le 3 février 2026'], ['Téléphone', '02 40 28 81 47']],
    fb: FB + 'pfbid0XdVPUY6itGnmmV1f11H8BktQ3xrzbJatRY8Va3PyN6V8Kxb1RKbyg84wEitEJyagl',
  },
  {
    id: 'jmt', titre: 'JMT, une nouvelle enseigne bientôt à Châteaubriant ?', rubrique: 'commerce', communes: ['chateaubriant'],
    resume: 'Une nouvelle enseigne pourrait prochainement arriver à Châteaubriant.',
    image: 'img/articles/jmt', ia: false, credit: 'Source à compléter', vues: null, tampon: 'Bientôt ?', fb: null,
  },
  {
    id: 'bricomarche', titre: 'Travaux de rénovation pour Bricomarché', rubrique: 'commerce', communes: ['chateaubriant'],
    resume: 'Façade, parking, drive : rue du Président Kennedy. Fin des travaux annoncée courant 2026.',
    image: 'img/articles/bricomarche', ia: false, credit: 'Photo : Castel Actu', vues: null, chantier: true,
    tampon: 'Rénovation', echeance: { quoi: 'Fin des travaux annoncée', libelle: 'courant 2026', fin: '2026-12-31' },
    fb: FB + 'pfbid02m7sSRE7zHt6TayZL979wb4p3Ufea42x4WHcndgb94GRSYfRp3bE47UsiqtWsE2PJl',
  },
  {
    id: 'super-u-lavage', titre: 'Super U : une nouvelle station de lavage automobile', rubrique: 'commerce', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/super-u-lavage', ia: false, credit: 'Photo : Castel Actu', vues: null, tampon: 'Nouveau',
    fb: FB + 'pfbid0P8JCjHiWNBRygFDcKZ61GSMKP5VUJgLXYxSA48t7GMbh5FjV9zdpAYHCj1hruFv6l',
  },
  {
    id: 'treffieux-api', titre: 'Treffieux : une nouvelle supérette API en accès libre 7j/7', rubrique: 'commerce', communes: ['treffieux'],
    resume: null, image: 'img/articles/treffieux-api', ia: false, credit: 'Visuel : API', vues: 1222, tampon: '7j/7',
    fb: FB + 'pfbid02Zuk2akBdhvDtpFc2j1XhkbSHVDkbTyPxsRdFfjYXvYmE5ow6V8sBDVHRay1QAAJ7l',
  },
  {
    id: 'voirie-d771', titre: 'Aménagement de voirie route de Soudan (D771)', rubrique: 'transport', communes: ['chateaubriant', 'soudan'],
    resume: 'Secteur Le Bois du Parc et La Sablière : sécurisation et modernisation de la zone en bordure de route.',
    image: 'img/articles/voirie-d771', provisoire: true, ia: false, vues: null, chantier: true, tampon: 'Travaux',
    fb: FB + 'pfbid0QKkkCBjAp2iXihYs2qW8SDbzGVG3RA3pDzxA114UzpFANZBEt8Q1iRZomoqryaqWl',
  },
  {
    id: 'rue-du-chateau', titre: 'Rue du Château : rénovation de la rue', rubrique: 'travaux', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/rue-du-chateau', ia: false, credit: 'Source à compléter', vues: 24770, chantier: true, tampon: 'Rénovation',
    fb: FB + 'pfbid03489UXX8eQ6pN4YJRABCtBjGp8LbxtuF1HCXyDmc1Miq7F3z1yW3NNEyMfZ9wrWebl',
  },
  {
    id: 'residence-aristide-briand', titre: 'La résidence Aristide Briand en construction', rubrique: 'travaux', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/residence-aristide-briand', ia: true, vues: 3068, chantier: true, tampon: 'En construction',
    fb: FB + 'pfbid02ypPDVFhB4Hj6ccEiLkoDYsZncE5oxJCFVsTc7o3Km5W3iZwqEkYgkYF7yBbsgTJcl',
  },
  {
    id: 'jardins-du-chateau', titre: 'La résidence Les Jardins du Château en construction', rubrique: 'travaux', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/jardins-du-chateau', ia: false, credit: 'Source à compléter', vues: 13251, chantier: true, tampon: 'En construction',
    fb: FB + 'pfbid0hhmHUovyfNDBRTRYnrkhXLkyPtTHF2Do8m95VYzc3BZjT5ySgokRH19MijCXv5URl',
  },
  {
    id: 'salle-xavier-hunault', titre: 'La salle des associations Xavier Hunault', rubrique: 'association', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/salle-xavier-hunault', ia: true, vues: 18244, chantier: true, tampon: 'Travaux en cours',
    fb: FB + 'pfbid0Ea3fGNCbrXqipi2JY4isLjV5yhNjNAAPtriav9DVGn6Szhkrm62cX5zWH8n491fml',
  },
  {
    id: 'piscine-espace-dauphin', titre: 'Piscine Espace Dauphin : rénovation en 2026', rubrique: 'travaux', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/piscine-espace-dauphin', ia: false, credit: 'Source à compléter', vues: 26524, chantier: true,
    tampon: 'Rénovation 2026', echeance: { quoi: 'Rénovation annoncée', libelle: 'en 2026', fin: '2026-12-31' },
    fb: FB + 'pfbid02Gych29rQsyeo9ys5aKncBq52H7KSPoiubrXNs8d4KKebj164oAYh4UnmXWdPTN6ul',
  },
  {
    id: 'rue-aristide-briand', titre: 'Rue Aristide Briand : projet de rénovation', rubrique: 'travaux', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/rue-aristide-briand', ia: true, vues: 15602, chantier: true, tampon: 'Projet',
    fb: FB + 'pfbid021Mpx3E5ez3cqJqLV74MoJmnFb7s4Y28qvUvqYXsF4iDwWDfTkqgdLsuPG8PZYpDml',
  },
  {
    id: 'theatre-verdure-choisel', titre: 'Un théâtre de verdure sur le site de Choisel', rubrique: 'culture', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/theatre-verdure-choisel', ia: false, credit: 'Photo : Castel Actu', vues: 20238,
    fb: FB + 'pfbid0in874XtHkxUnEmYMSfu7JHgHVygufR9mRsAXw9tDAciDxfxWBWfgcHNjeXeu69tNl',
  },
  {
    id: 'hauts-de-bere', titre: 'Les Hauts de Béré : projet annulé', rubrique: 'travaux', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/hauts-de-bere', ia: false, credit: 'Photo : Castel Actu', vues: 12452, chantier: true, tampon: 'Projet annulé',
    fb: FB + 'pfbid0bH94nYR3uJVoRDT8bFWy3Wv2jXBUGFLTTfRYmBYNLGDFPUnc7awXqSZ5aC6GpzvSl',
  },
  {
    id: 'maison-des-associations', titre: 'Une maison des associations, prochainement', rubrique: 'association', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/maison-des-associations', ia: true, vues: 3549, chantier: true, tampon: 'Prochainement',
    fb: FB + 'pfbid0KKN9KHtSGzWsYnZL7Uzihvq3bmUTc9vcuz4aHpDsMnS6EmTW629TFLUBQqFQLvv3l',
  },
  {
    id: 'moulin-de-bere', titre: 'Domaine du Moulin de Béré : des logements', rubrique: 'travaux', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/moulin-de-bere', ia: false, credit: 'Photo : Castel Actu', vues: null, fb: null,
  },
  {
    id: 'alain-hunault-mairie', titre: 'Alain Hunault reconduit à la mairie de Châteaubriant', rubrique: 'vie-municipale', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/alain-hunault-mairie', ia: false, credit: 'Visuel : Castel Actu', vues: null,
    fb: FB + 'pfbid0e7qAfaPnvXL8EfCu2S35bC3RnGJzp84YNyqr1o1hJS6m2Rfk5vdhbhXdpMbwv5QCl',
  },
  {
    id: 'chateau-trinite', titre: 'Le château de la Trinité : un nouveau projet', rubrique: 'divers', communes: ['chateaubriant'],
    resume: null, image: 'img/articles/chateau-trinite', ia: false, credit: 'Photo : Castel Actu', vues: null,
    fb: FB + 'pfbid0xy2NYHHouCJKiHdK5Cr2BzxwzVkaUH46UfJEwJEtqENSpfTXFNZ5QYjaj2znYuJ2l',
  },
];

// Agenda : les dates passées s'affichent automatiquement comme passées.
export const AGENDA = [
  {
    id: 'foire-de-bere', titre: 'Foire de Béré', lieu: 'Châteaubriant', debut: '2026-09-11', fin: '2026-09-14',
    libelle: 'Du 11 au 14 septembre 2026', image: 'img/agenda/foire-de-bere', ia: true, lien: 'https://www.foiredebere.fr/',
    note: 'Dates de la prochaine édition à compléter.',
  },
  {
    id: 'theatre-de-verre', titre: 'Théâtre de Verre, saison 2025-2026', lieu: 'Châteaubriant', debut: '2025-09-01', fin: '2026-06-30',
    libelle: 'Saison 2025-2026', image: 'img/agenda/theatre-de-verre-2025-26', ia: false, credit: 'Affiche : Ville de Châteaubriant',
    lien: 'https://www.mairie-chateaubriant.fr/theatre-de-verre/', note: 'Affiche de la saison 2026-2027 à compléter.',
  },
];

export const PODCASTS = [
  { id: 'economie', titre: 'Info en bref : économie', duree: '1:04', audio: 'audio/info-en-bref-economie.mp3' },
  { id: 'evenement', titre: 'Info en bref : événement', duree: '1:04', audio: 'audio/info-en-bref-evenement.mp3' },
];

// Outils communs
export const AUJOURDHUI = new Date();
export function rubrique(id) { return RUBRIQUES.find(r => r.id === id) || { id, nom: id }; }
export function commune(id) { return COMMUNES.find(c => c.id === id) || { id, nom: id }; }
export function echeancePassee(a, now = AUJOURDHUI) {
  return !!(a.echeance && new Date(a.echeance.fin + 'T23:59:59') < now);
}
export function srcset(base) { return `${base}-480.webp 480w, ${base}-960.webp 960w, ${base}-1600.webp 1600w`; }
export function nombre(n) { return new Intl.NumberFormat('fr-FR').format(n); }
