// Central facts for the whole site. Update class details, contact details and
// links here; every page reads from this file.

export const site = {
  name: 'Colton & Colwich T’ai Chi',
  shortName: 'Colton T’ai Chi',

  // The planned main address. Canonical URLs, the sitemap and sharing images all
  // use this value. Set originConfirmed to true once the domain is connected and
  // serving this site over HTTPS.
  origin: 'https://www.colwichtaichi.org.uk',
  originConfirmed: false,

  // Keep false for previews. Set true only during an authorised launch, along
  // with removing the X-Robots-Tag header in netlify.toml.
  allowIndexing: false,

  instructor: 'Andrew Marshall',
};

export const classDetails = {
  day: 'Tuesdays',
  time: '10–11am',
  timeMachine: { opens: '10:00', closes: '11:00', dayOfWeek: 'Tuesday' },
  price: '£5 per session',
  priceNote: 'No membership fee',
};

export const venue = {
  name: 'Colton Village Hall',
  addressLines: ['Reading Room Drive, off Bellamour Way', 'Colton, Rugeley', 'Staffordshire WS15 3LN'],
  locality: 'Colton',
  postcode: 'WS15 3LN',
  website: 'https://www.coltonvillagehall.co.uk/',
  // A map search for the hall's address. Andrew confirmed it opens the hall.
  directionsUrl:
    'https://www.google.com/maps/search/?api=1&query=Colton+Village+Hall%2C+Reading+Room+Drive%2C+Colton%2C+Rugeley+WS15+3LN',
};

export const contact = {
  email: 'ask@andrewtaichi.com',
  phones: [
    { label: 'Landline', display: '01889 808449', tel: '01889808449' },
    { label: 'Mobile', display: '07941 650255', tel: '07941650255' },
  ],
  facebook: { url: 'https://www.facebook.com/coltontaiji/', handle: '@coltontaiji' },
};

export const links = {
  union: 'http://www.taichiunion.com/',
};

export const nav = [
  { label: 'Classes', href: '/#classes' },
  { label: 'About', href: '/#about' },
  { label: 'Find us', href: '/#find-us' },
  { label: 'Contact', href: '/#contact' },
];
