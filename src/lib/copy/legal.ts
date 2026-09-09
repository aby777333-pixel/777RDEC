import {
  COMPANY_NUMBER,
  CONTACT_EMAIL,
  JURISDICTION_NOTE,
  LEGAL_ENTITY_JURISDICTION,
  LEGAL_ENTITY_NAME,
  REGISTERED_ADDRESS,
  RISK_LINE_SHORT,
  SITE_NAME,
  TECHNOLOGY_PROVIDER_DISCLOSURE,
} from '@/lib/brand'

export type LegalSection = { heading: string; paragraphs: readonly string[] }

export type LegalDocument = {
  slug: string
  title: string
  description: string
  intro: string
  sections: readonly LegalSection[]
}

const ENTITY_LINE = `${LEGAL_ENTITY_NAME} (${LEGAL_ENTITY_JURISDICTION}), Company No. ${COMPANY_NUMBER}, ${REGISTERED_ADDRESS}.`

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  {
    slug: 'technology-provider',
    title: 'Technology Provider Notice',
    description:
      'What 777 Raptor does and does not do. 777 Raptor is a technology provider, not a broker.',
    intro: TECHNOLOGY_PROVIDER_DISCLOSURE,
    sections: [
      {
        heading: 'What we provide',
        paragraphs: [
          `${SITE_NAME} builds and licenses trading technology: a trading terminal, client relationship management, a client portal, back-office tooling, a risk engine, programmatic interfaces and an intelligence layer.`,
          'Our clients are brokers, financial institutions, proprietary trading firms and professional desks. They license this technology and operate it under their own regulatory permissions.',
        ],
      },
      {
        heading: 'What we do not provide',
        paragraphs: [
          'We do not provide brokerage services. We do not hold client money or client assets, and we do not provide custody.',
          'We do not provide investment advice, investment recommendations or portfolio management. Nothing on this website, and nothing produced by any feature described on it, is a recommendation to enter into any transaction.',
          'We do not provide liquidity. Where this website describes liquidity or connectivity, it means the technology connects to venues and providers that our client has selected and contracted with directly.',
          'We are not a counterparty to any trade executed through technology we license.',
        ],
      },
      {
        heading: 'Where a regulated activity is involved',
        paragraphs: [
          'Any regulated activity is carried out by the licensed entity operating the technology, under its own permissions and in the jurisdictions where it is authorised, and not by us.',
          'Where a named 777 Raptor group entity is itself authorised for a regulated activity, that authorisation is stated explicitly by that entity and applies only to the activities and jurisdictions named in it.',
        ],
      },
      {
        heading: 'Automation and the intelligence layer',
        paragraphs: [
          'Features described on this site as intelligence or automation operate only within permissions and limits configured by the operator or the end user. They are analytical and control tools.',
          RISK_LINE_SHORT,
        ],
      },
      { heading: 'Entity', paragraphs: [ENTITY_LINE] },
    ],
  },
  {
    slug: 'risk-disclosure',
    title: 'Risk Disclosure',
    description:
      'The risks of trading leveraged products, and the limits of what technology can do about them.',
    intro: RISK_LINE_SHORT,
    sections: [
      {
        heading: 'Leverage',
        paragraphs: [
          'Leveraged products allow exposure that is substantially larger than the capital committed. Losses can exceed deposits with some products and in some jurisdictions, and can accumulate faster than positions can be closed.',
          'A small adverse move in the underlying market can result in the loss of the entire amount deposited.',
        ],
      },
      {
        heading: 'Market risk',
        paragraphs: [
          'Prices are volatile and are influenced by factors outside the control of any participant, including economic data, monetary policy, geopolitical events and changes in market liquidity.',
          'Markets can gap. A stop order is an instruction to trade at the next available price once a level is reached, not a guarantee of that level.',
        ],
      },
      {
        heading: 'Liquidity and execution',
        paragraphs: [
          'Liquidity varies by instrument and by session. In thin conditions spreads widen, orders may fill at prices materially different from those displayed, and some orders may not fill at all.',
          'Execution depends on the venues and providers your broker has connected, and on network and system conditions at the time.',
        ],
      },
      {
        heading: 'Technology risk',
        paragraphs: [
          'Any technology can fail, degrade or be unavailable. Connectivity, data feeds, third-party services and your own device or network can all interrupt access to a market at the moment you most want it.',
          'You should understand what happens to your open positions if you lose access, and should not rely on a single channel to manage risk.',
        ],
      },
      {
        heading: 'Analysis, intelligence and automation',
        paragraphs: [
          'Analytical outputs, condition assessments and correlation readings describe observed or historical behaviour. They are not forecasts, and a relationship that held previously may not hold in future.',
          'Automation operates within the limits it has been given. Correctly enforced limits reduce the chance of an unintended position; they do not reduce the market risk of an intended one.',
          'Any figures shown on this site — prices, exposures, correlations, profit and loss — are illustrative examples chosen to explain a concept. They are not market data, not results, not a track record, and not indicative of any outcome.',
        ],
      },
      {
        heading: 'Suitability',
        paragraphs: [
          'Leveraged trading is not suitable for everyone. You should consider your objectives, your experience and your capacity to bear losses, and seek independent advice if anything is unclear.',
          'Past performance is not a reliable indicator of future results.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Notice',
    description: 'What personal data this website collects, why, and how long it is kept.',
    intro:
      'This notice covers the 777raptor.com website only. If you are a client of a brokerage that runs on Raptor technology, that brokerage is the controller of your account data and its own notice applies.',
    sections: [
      {
        heading: 'What we collect',
        paragraphs: [
          'When you submit a form we collect the details you enter: your name, email address, and optionally your company, role, region, products of interest and message. We also record which page the form was submitted from.',
          'We collect no personal data from you simply for browsing. Aggregate, anonymous usage measurement runs only if you accept it in the cookie banner.',
        ],
      },
      {
        heading: 'Why we use it',
        paragraphs: [
          'To respond to your enquiry, to arrange and prepare a demonstration, and to keep a record of the consent you gave.',
          'We do not sell personal data, and we do not use form submissions for unrelated marketing.',
        ],
      },
      {
        heading: 'Legal basis',
        paragraphs: [
          'Where you submit an enquiry, we rely on your consent and on our legitimate interest in responding to a business enquiry you initiated.',
          'You may withdraw consent at any time by writing to us, and we will stop contacting you.',
        ],
      },
      {
        heading: 'Where it is stored',
        paragraphs: [
          'Form submissions are stored in a managed Postgres database with access restricted to service credentials held server-side. The website has no browser-level read access to submitted data.',
          'Notification emails about your enquiry are delivered through a transactional email provider.',
        ],
      },
      {
        heading: 'How long we keep it',
        paragraphs: [
          'Enquiry records are kept for as long as needed to deal with the enquiry and any resulting relationship, and are then deleted. If you ask us to delete your enquiry sooner, we will.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'Depending on where you live you may have rights to access, correct, delete, restrict or object to our use of your personal data, and to receive a copy of it.',
          `To exercise any of these, write to ${CONTACT_EMAIL}. You may also complain to your local data protection authority.`,
        ],
      },
      { heading: 'Controller', paragraphs: [ENTITY_LINE] },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookie Notice',
    description: 'Which cookies and local storage this website uses, and what declining changes.',
    intro:
      'This site uses as little client-side storage as it can. No analytics or third-party script loads before you accept it.',
    sections: [
      {
        heading: 'Essential storage',
        paragraphs: [
          'raptor-theme — remembers whether you chose the light, dark or system theme. Local storage, no expiry, no identifier.',
          'raptor-consent — remembers your cookie choice so we do not ask again. Local storage.',
          'raptor-reduce-motion — remembers the reduce-motion toggle in the footer. Local storage.',
          'raptor-audience — remembers which audience tab you last chose on the homepage, so the demo form can default its "I am a…" field. A cookie, 90 days, contains only a role keyword and no identifier.',
        ],
      },
      {
        heading: 'Measurement, only with consent',
        paragraphs: [
          'If you accept, we load a privacy-focused analytics script that records aggregate page views without cookies and without building a profile of you.',
          'If you decline, that script is never added to the page and no request is made to it. Declining changes nothing about how the site works.',
        ],
      },
      {
        heading: 'Changing your mind',
        paragraphs: [
          'Clear this site’s storage in your browser and the banner will appear again on your next visit.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Website Terms of Use',
    description: 'The terms on which this website is made available.',
    intro:
      'These terms cover use of the 777raptor.com website. They are not a licence to any Raptor software; software is licensed under a separate written agreement.',
    sections: [
      {
        heading: 'Information only',
        paragraphs: [
          'This website describes technology products. It does not constitute an offer, a solicitation, investment advice or a recommendation, and it is not directed at any person in a jurisdiction where publishing or accessing it would be contrary to local law.',
        ],
      },
      {
        heading: 'Illustrative figures',
        paragraphs: [
          'This website is not connected to any market, any account or any venue. Nothing you do on it has any financial effect.',
          'Every price, position, exposure and correlation figure shown here is an illustrative example. Product demonstrations are arranged directly with us and are not conducted through this website.',
        ],
      },
      {
        heading: 'Accuracy',
        paragraphs: [
          'We take care to describe the products accurately and to distinguish what exists today from what is planned. Product capabilities change; the version described here may differ from the version delivered under a licence agreement.',
          'Where this site describes a control or a capability, the authoritative description is the one in your licence agreement and its documentation.',
        ],
      },
      {
        heading: 'Intellectual property',
        paragraphs: [
          'The content, design, code and marks on this website belong to us or our licensors. You may read, print and share pages for your own evaluation; you may not copy the site or its design for another product.',
        ],
      },
      {
        heading: 'Liability',
        paragraphs: [
          'This website is provided as-is. To the extent permitted by law we exclude liability for loss arising from reliance on it, and nothing here excludes liability that cannot lawfully be excluded.',
        ],
      },
      { heading: 'Entity and contact', paragraphs: [ENTITY_LINE, `Questions: ${CONTACT_EMAIL}.`] },
    ],
  },
  {
    slug: 'notices',
    title: 'Notices',
    description: 'Trademarks, third-party components and the standing disclosures for this site.',
    intro: 'Standing notices that apply across the site.',
    sections: [
      {
        heading: 'Standing disclosures',
        paragraphs: [TECHNOLOGY_PROVIDER_DISCLOSURE, RISK_LINE_SHORT, JURISDICTION_NOTE],
      },
      {
        heading: 'No live data',
        paragraphs: [
          'Nothing on this site displays live market data, and nothing displays the results of any real account. Figures are illustrative examples.',
        ],
      },
      {
        heading: 'Illustrative examples',
        paragraphs: [
          'API examples use fictional hostnames, keys and identifiers. Correlation and exposure figures shown on this site are illustrative and fixed, not computed from a market feed.',
        ],
      },
      {
        heading: 'Trademarks',
        paragraphs: [
          'Third-party names and marks referred to on this site belong to their respective owners. Their use does not imply endorsement or any relationship unless stated.',
        ],
      },
      {
        heading: 'Third-party components',
        paragraphs: [
          'This website is built with open-source software, including React, Next.js, Tailwind CSS and TradingView’s Lightweight Charts, used under their respective licences.',
        ],
      },
      {
        heading: 'Certifications',
        paragraphs: [
          'We publish no certification badges. Where we hold a certification or a report, we will name it and provide evidence on request rather than display a logo.',
        ],
      },
    ],
  },
  {
    slug: 'jurisdictions',
    title: 'Jurisdictions',
    description: 'Availability of products, markets and automation features differs by jurisdiction.',
    intro: JURISDICTION_NOTE,
    sections: [
      {
        heading: 'Availability differs',
        paragraphs: [
          'The products described on this site are licensed to firms that operate them under their own regulatory permissions. What an end client can access depends on that firm, its licences, and the rules of the client’s own jurisdiction.',
          'Some instruments, asset classes, leverage levels and automation features are restricted or prohibited in some regions. A feature described here may therefore be unavailable to you even where the platform supports it.',
        ],
      },
      {
        heading: 'No targeting',
        paragraphs: [
          'Nothing on this site is directed at any person in a jurisdiction where the publication or availability of this information would be contrary to local law or regulation.',
          'This site is not an offer to any person in any jurisdiction in which such an offer would be unlawful.',
        ],
      },
      {
        heading: 'Your responsibility',
        paragraphs: [
          'You are responsible for knowing whether accessing or using these products is permitted where you are, and for complying with the rules that apply to you.',
        ],
      },
      {
        heading: 'Ask us',
        paragraphs: [
          `If you need to know whether a specific capability is available in a specific jurisdiction, write to ${CONTACT_EMAIL} and we will answer specifically rather than generally.`,
        ],
      },
    ],
  },
]

export const LEGAL_MAP: ReadonlyMap<string, LegalDocument> = new Map(
  LEGAL_DOCUMENTS.map((doc) => [doc.slug, doc]),
)
