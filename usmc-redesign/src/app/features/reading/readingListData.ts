import onceAnEagleCover from '@/app/assets/reading/once-an-eagle.jpg';
import { readingCoverMap } from './readingCoverMap';

export type ReadingResourceKind = 'amazon' | 'pdf';
export type ReadingShelfId =
  | 'commandants-choice'
  | 'heritage'
  | 'innovation'
  | 'leadership'
  | 'strategy'
  | 'foundation';

export interface ReadingBook {
  title: string;
  author: string;
  pages?: number;
  description?: string;
  kind?: ReadingResourceKind;
  href?: string;
  cover?: string;
  badge?: string;
}

export interface ReadingShelf {
  id: ReadingShelfId;
  label: string;
  kicker: string;
  description: string;
  books: ReadingBook[];
}

function createAmazonSearchUrl(title: string, author: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(`${title} ${author}`)}`;
}

function withDefaults(books: ReadingBook[]): ReadingBook[] {
  return books.map((book) => ({
    kind: 'amazon',
    href: createAmazonSearchUrl(book.title, book.author),
    ...book,
    cover: readingCoverMap[book.title] ?? book.cover,
  }));
}

export const readingShelves: ReadingShelf[] = [
  {
    id: 'commandants-choice',
    label: "COMMANDANT'S CHOICE",
    kicker: "CMC'S PICK",
    description: 'The single title to tackle first if you want one book that frames service, duty, and command under pressure.',
    books: withDefaults([
      {
        title: 'Once an Eagle',
        author: 'A. Myrer',
        pages: 1312,
        description: 'A sweeping novel following two officers across three wars — the principled Sam Damon and the opportunistic Courtney Massengale — that lays bare the difference between genuine leadership and careerism at every level of command. Required reading at multiple service schools for good reason.',
        badge: 'Priority read',
        cover: onceAnEagleCover,
        href: 'https://www.amazon.com/Once-Eagle-Anton-Myrer/dp/0062221620?crid=1ML7Q0HI69SLU&dib=eyJ2IjoiMSJ9.AvTLBFPsP3uYPMBIddkrNp-us6clG_3muNEtQUN67nRfsyODykbzIDytXWGujkgBIvu1b63wg0UNnxnBkyJlE0fbZyLENEYvG5mllPGwHFinIhyjSQNJoASsaeC6WuqXEL50rHKgNgMO08G6G7Nt71A3g5DYhhMIRT-3I69r66x3i3edIoD9V7xVDUH9sUnR-UKLB3tnpBo2fsEZ3Jd0A95C0nlyLOk4j7SuRT99TRE.Ga0idWsgAin2PjukwdHpJyJdrdmL_yLnu7WF3Cvb_E4&dib_tag=se&keywords=ONCE+AN+EAGLE&qid=1779086727&sprefix=once+an+eagle%2Caps%2C439&sr=8-1&linkCode=ll2&tag=staymarineboo-20&linkId=bee3dd74d2d355ae883f93ea333258a5&language=en_US&ref_=as_li_ss_tl',
      },
    ]),
  },
  {
    id: 'heritage',
    label: 'HERITAGE',
    kicker: 'ROOTED IN THE CORPS',
    description: 'Campaigns, personalities, and turning points that sharpen perspective on where the Corps came from and how Marines have adapted in every era.',
    books: withDefaults([
      {
        title: 'How the Few Became the Proud: Crafting the Marine Corps Mystique, 1874-1918',
        author: 'Heather Venable',
        pages: 296,
        description: 'Examines how the Marine Corps built its warrior culture and public identity between 1874 and 1918, tracing the recruitment campaigns, training reforms, and institutional decisions that set the Corps apart from the Army and forged a mystique that still shapes recruiting today.',
        href: 'https://www.amazon.com/How-Few-Became-Proud-Transforming/dp/1682479196?crid=GTNSU1W8XQ08&dib=eyJ2IjoiMSJ9.F5GY4lhgTh3l5-n42QX91zora2yA7Yx4NV2nHR_vXmr6WSiT6Dx3FhK5b1uq4F--.Z3c44Ue3rBG1AzjcRltCL38ipknsgIl8zN51OQncAgY&dib_tag=se&keywords=How+the+Few+Became+the+Proud%3A+Crafting+the+Marine+Corps+Mystique%2C+1874-1918&nsdOptOutParam=true&qid=1779087307&sprefix=how+the+few+became+the+proud+crafting+the+marine+corps+mystique%2C+1874-1918%2Caps%2C258&sr=8-1&linkCode=ll2&tag=staymarineboo-20&linkId=c862704f2bf16fe7f9ccad98508f3f94&language=en_US&ref_=as_li_ss_tl',
      },
      {
        title: "Lejeune: A Marine's Life, 1867-1942",
        author: 'Merrill L. Bartlett',
        pages: 264,
        description: "The definitive biography of General John A. Lejeune, the 13th Commandant who rebuilt the Corps after WWI and whose philosophy of the officer-NCO-Marine relationship still echoes in doctrine today. Understanding Lejeune is understanding where the Corps' culture of mission command came from.",
        href: 'https://www.amazon.com/LeJeune-Marines-1867-1942-Bluejacket-Books/dp/1557500630?crid=3O874A0XJUV2C&dib=eyJ2IjoiMSJ9.YXCv_3K4sdt25Q3FW98LejPSe8QqipgKwMYduiaasppe3Hv_2rthogz_BpJGLnwrgbEfFeqpKmJ2qQ1VwjpwNaMlY701joEcd3ll0qOUl12v_EWWF-AC37yK9mRT8p7KwJaoC5tV-osKjd93y6aB7g.zhyZGLWdXa6yUC6YO6k6Y3dCzZcKJl8YqpxMUe4oVB8&dib_tag=se&keywords=Lejeune%3A+A+Marine%27s+Life%2C+1867-1942&qid=1779087559&sprefix=lejeune+a+marine%27s+life%2C+1867-1942%2Caps%2C254&sr=8-1&linkCode=ll2&tag=staymarineboo-20&linkId=6792bce7e794611fde0660276937eede&language=en_US&ref_=as_li_ss_tl',
      },
      {
        title: 'First to Fight: An Inside View of the U.S. Marine Corps',
        author: 'Victor H. Krulak',
        pages: 256,
        description: "General Victor Krulak's spirited argument for the Marine Corps' purpose and existence, drawing on amphibious theory and two centuries of history to make the case for why a force-in-readiness that can land and fight anywhere remains essential to national defense. A foundational text for any Marine who wants to understand why the Corps is built the way it is.",
        href: 'https://www.amazon.com/First-Fight-Inside-Marine-Bluejacket/dp/1557504644?crid=MFQOSCHME7L8&dib=eyJ2IjoiMSJ9.RZCYmmx4V1VamG49IDYp9T2BeeOiEbgMaXHMDhX35rIYcM6qo32pB1PdzJ3Ri4eMDqKnB0-E5zKIUHeXrL0qPCsWXLMqNphs4qYO3bxaRZeIzTXYsbfHyIzgGLPyuV8tMG0s3H0cEJ9MSThRbFCvF0u6eZ93_ZfQYQmvR6hZ1uUo_dz2ToNxbxLGgBmLbOpZXa3oUX0npOF50P3n2DV9xxTPV-reIa7iUX8EfMZtX-s.DPyzSX2ueNm82WAbUZM3OM0TLHjYV899GGzhzjY9U8k&dib_tag=se&keywords=First+to+Fight%3A+An+Inside+View+of+the+U.S.+Marine+Corps&nsdOptOutParam=true&qid=1779087705&sprefix=first+to+fight+an+inside+view+of+the+u.s.+marine+corps%2Caps%2C254&sr=8-1&linkCode=ll2&tag=staymarineboo-20&linkId=8589601d5210118f8ba4424b7ef19e35&language=en_US&ref_=as_li_ss_tl',
      },
      {
        title: 'Always Faithful: 250 Years of Remarkable Stories from the Collections of the National Museum of the Marine Corps',
        author: 'Owen Conner',
        description: 'Drawn from the permanent collection of the National Museum of the Marine Corps, this volume presents rare and previously unseen artifacts alongside the personal stories of individual Marines and the broader institutional traditions they represent — a 250th anniversary survey of what the Corps keeps, and why.',
        kind: 'pdf',
        href: '/reading/always-faithful.pdf',
      },
      {
        title: 'Semper Fidelis: 250 Years of U.S. Marine Corps Honor, Courage, and Commitment',
        author: 'Marine Corps History Division',
        description: "The Marine Corps History Division's commemorative survey of 250 years of service, tracing the institution's campaigns, evolution, and culture through the lens of the core values that define it — a broad reference for understanding the full arc of the Corps from its founding to the present.",
        kind: 'pdf',
        href: '/reading/semper-fidelis.pdf',
      },
      {
        title: 'With the Old Breed: At Peleliu and Okinawa',
        author: 'Eugene B. Sledge',
        pages: 326,
        description: "Eugene Sledge's searing firsthand account of infantry combat at Peleliu and Okinawa — widely regarded as the most honest and devastating memoir of Pacific ground warfare ever written. A direct window into what sustained men through the worst fighting the war produced, and what it cost them afterward.",
        href: 'https://amzn.to/4uWAWf9',
      },
      {
        title: 'Delivering Destruction: American Firepower and Amphibious Assault from Tarawa to Iwo Jima',
        author: 'Chris K. Hemler',
        pages: 256,
        description: 'The first detailed study of how the Marine Corps developed triphibious fire support coordination across the Central Pacific campaign, tracing the costly lessons of Tarawa through the hard-won precision of Iwo Jima. A case study in wartime organizational learning and the price paid when fire coordination fails.',
        href: 'https://amzn.to/4ugUWJz',
      },
      {
        title: 'This Kind of War: The Classic Korean War History, 50th Anniversary Edition',
        author: 'T.R. Fehrenbach',
        pages: 483,
        description: "Fehrenbach's landmark study of the Korean War argues that no amount of technology or airpower replaces the trained, disciplined infantryman — and that nations that forget this pay for it in blood. Written with the urgency of a warning, it still challenges every generation that assumes the next war will be cleaner than the last.",
        href: 'https://amzn.to/4wz6hGl',
      },
      {
        title: "The Marines of Montford Point: America's First Black Marines",
        author: 'Melton A. McLaurin',
        pages: 216,
        description: "Documents the first Black Marines who trained at Montford Point Camp from 1942 to 1949, facing institutional racism within the Corps while still proving themselves in combat. Their story is inseparable from understanding both the Marine Corps' history and the cost of discrimination within an institution that prides itself on standards.",
        href: 'https://amzn.to/3PTKB7n',
      },
      {
        title: 'Code Talker: The First and Only Memoir by One of the Original Navajo Code Talkers of WWII',
        author: 'Chester Nez and Judith Avila',
        pages: 320,
        description: "Chester Nez's firsthand account of being recruited as one of the original Navajo Marines to develop an unbreakable battlefield code — the only memoir from one of the original Code Talkers, written by the last survivor before his death. A story of service, identity, and an unsung contribution that helped win the Pacific.",
        href: 'https://amzn.to/4dAcVDO',
      },
      {
        title: 'Corps Competency?: III Marine Amphibious Force Headquarters in Vietnam',
        author: 'Michael F. Morris',
        pages: 348,
        description: "A retired Marine colonel's rigorous assessment of III MAF leadership in I Corps from 1965 to 1970, arguing that the senior Marine headquarters was not prepared to fight a sustained hybrid war and failed to translate tactical success into strategic outcomes. An unflinching case study in what happens when a corps headquarters fights the war it wants rather than the one it must.",
        href: 'https://amzn.to/4nB44WO',
      },
      {
        title: 'Targeted: Beirut: The 1983 Marine Barracks Bombing and the Untold Story of the War on Terror',
        author: 'Jack Carr and James M. Scott',
        pages: 464,
        description: "The authoritative account of the October 1983 bombing that killed 241 American servicemen — the Corps' worst single-day loss since Iwo Jima. Built on survivor interviews, military records, and personal diaries, the book traces both the attack itself and how it shaped U.S. counterterrorism policy for the decades that followed.",
        href: 'https://amzn.to/4uT4472',
      },
      {
        title: "Echo in Ramadi: The Firsthand Story of US Marines in Iraq's Deadliest City",
        author: 'Scott A. Huesing',
        pages: 336,
        description: "Battalion commander Scott Huesing's ground-level account of leading Marines through Ramadi, Iraq's most contested city in 2006. Every chapter tests small-unit leadership, fire discipline, and the trust between commanders and subordinates that determines whether a unit holds together or comes apart.",
        href: 'https://amzn.to/4wFb1KK',
      },
      {
        title: 'The American War in Afghanistan: A History',
        author: 'Carter Malkasian',
        pages: 576,
        description: "Carter Malkasian's comprehensive history of the 20-year conflict, written by a former State Department adviser who served there. He balances military operations, diplomatic failures, and Afghan perspectives with rare clarity — explaining both why the effort was made and why, despite enormous sacrifice, it fell short.",
        href: 'https://amzn.to/4uoG5Nl',
      },
      {
        title: 'On Contested Shores: The Evolving Role of Amphibious Operations in the History of Warfare (Vols. I & II)',
        author: 'Edited by Timothy Heck, B.A. Friedman, and Walker D. Mills',
        description: 'A two-volume Marine Corps University Press collection examining amphibious operations across centuries of warfare, from 16th-century Italy to the modern era. Each chapter analyzes a different historical campaign through the lens of doctrine, logistics, technology, or policy — filling a genuine gap in amphibious scholarship.',
        kind: 'pdf',
        href: '/reading/on-contested-shores.pdf',
      },
    ]),
  },
  {
    id: 'innovation',
    label: 'INNOVATION',
    kicker: 'ADAPT FASTER',
    description: 'Titles for doctrine, experimentation, technology, and the habits that help units out-think the next problem instead of reacting late.',
    books: withDefaults([
      {
        title: 'Learning War: The Evolution of Fighting Doctrine in the U.S. Navy, 1898-1945',
        author: 'Trent Hone',
        pages: 432,
        description: 'Traces how the U.S. Navy transformed its fighting doctrine between 1898 and 1945 through deliberate war gaming, fleet exercises, and institutional learning — a model of how large military organizations can adapt faster than their enemies when they build the right feedback loops.',
        href: 'https://amzn.to/4ugVHCp',
      },
      {
        title: 'A Game of Birds and Wolves: The Ingenious Young Women Whose Secret Board Game Helped Win World War II',
        author: 'Simon Parkin',
        pages: 320,
        description: "The story of the British Wrens who used a classified board game to crack the German U-boat problem threatening Allied convoys — showing how unconventional thinkers working outside traditional channels solved a tactical puzzle that formally trained analysts had missed. A reminder that good ideas don't always come from the top.",
        href: 'https://amzn.to/42K23hC',
      },
      {
        title: 'Playing War: Wargaming and U.S. Navy Preparations for World War II',
        author: 'John M. Lillard',
        pages: 224,
        description: 'Examines how the interwar U.S. Navy used war games at the Naval War College to test tactics, experiment with doctrine, and prepare officers for decisions they would face in the Pacific — recasting war gaming as a serious instrument of institutional learning, not a staff pastime.',
        href: 'https://amzn.to/4uqSfoQ',
      },
      {
        title: "Neptune's Inferno: The U.S. Navy at Guadalcanal",
        author: 'James D. Hornfischer',
        pages: 516,
        description: "James Hornfischer's account of the brutal night surface battles around Guadalcanal in 1942-43, where outgunned American sailors fought a superior Japanese force to hold the sea lanes and keep the Marines ashore alive. A story of improvised tactics, catastrophic losses, and the grinding determination that won the campaign.",
        href: 'https://amzn.to/43oozg1',
      },
      {
        title: 'A New Conception of War: John Boyd, the U.S. Marines, and Maneuver Warfare',
        author: 'Ian T. Brown',
        pages: 360,
        description: "Traces how John Boyd's OODA loop theory was adopted by the Marine Corps, making it the first American service to formally embrace maneuver warfare doctrine. A behind-the-scenes account of intellectual insurgency inside a large institution — and a model for how ideas change organizations from within.",
        kind: 'pdf',
        href: '/reading/a-new-conception-of-war.pdf',
      },
      {
        title: 'Where Good Ideas Come From: The Natural History of Innovation',
        author: 'Steven Johnson',
        pages: 336,
        description: "Steven Johnson's study of the conditions that produce breakthrough innovation across five centuries, arguing that transformative ideas emerge from networks, slow hunches, and adjacent possibilities — not lone genius. With direct implications for how units and institutions build cultures that actually generate new thinking.",
        href: 'https://amzn.to/3RP7j0Y',
      },
      {
        title: 'The Origins of Victory: How Disruptive Military Innovation Determines the Fates of Great Powers',
        author: 'Andrew F. Krepinevich Jr.',
        pages: 568,
        description: "Krepinevich's examination of how militaries that successfully pursue disruptive innovation gain decisive advantages over rivals — and how those that miss the next revolution risk irrelevance or defeat. Drawing on historical precedent, he maps the emerging military competition and identifies where the U.S. must move faster.",
        href: 'https://amzn.to/4umKmAE',
      },
      {
        title: 'Evolution on Demand: The Changing Roles of the U.S. Marine Corps in Twenty-first Century Conflicts and Beyond',
        author: 'Joanna Siekiera',
        pages: 317,
        description: 'A Marine Corps University Press volume examining the strategic, operational, and technological factors shaping future conflict, with contributors offering concrete assessments of where the Corps must evolve to remain effective. Written for leaders who need to think beyond current doctrine before the next fight defines the question.',
        kind: 'pdf',
        href: '/reading/evolution-on-demand.pdf',
      },
      {
        title: '7 Seconds to Die: A Military Analysis of the Second Nagorno-Karabakh War and the Future of Warfighting',
        author: 'John F. Antal',
        pages: 160,
        description: "A military analysis of the 2020 Second Nagorno-Karabakh War, where Azerbaijan's loitering munitions and commercial drones dismantled Armenian armor in 44 days. A blueprint for how cheap precision weapons are reshaping ground combat faster than most doctrine can absorb.",
        href: 'https://amzn.to/4fuXAXp',
      },
      {
        title: 'Next War: Reimagining How We Fight',
        author: 'John F. Antal',
        pages: 256,
        description: "John Antal's scenario-based look at how AI, robotics, and autonomous systems will change the character of future conflict. Written for commanders who need to think through the next war before it starts — and who understand that waiting for doctrine to catch up is not a strategy.",
        href: 'https://amzn.to/4tP5sXB',
      },
      {
        title: 'The Fourth Industrial Revolution',
        author: 'Klaus Schwab',
        pages: 192,
        description: "Klaus Schwab's accessible overview of how AI, biotechnology, and digital systems are fusing the physical, digital, and biological worlds. Essential context for any leader navigating rapid technological change and thinking seriously about its implications for doctrine, force structure, and the character of future competition.",
        href: 'https://amzn.to/43ggslJ',
      },
      {
        title: 'Soft-Wired: How the New Science of Brain Plasticity Can Change Your Life',
        author: 'Michael Merzenich',
        pages: 266,
        description: "Neuroscientist Michael Merzenich draws on decades of research to show that cognitive decline is neither inevitable nor irreversible — and that deliberate mental training reshapes the brain at any age. Directly relevant to how leaders build and maintain sharp judgment under sustained operational pressure.",
        href: 'https://amzn.to/4ukfbpz',
      },
      {
        title: 'Co-Intelligence: Living and Working with AI',
        author: 'Ethan Mollick',
        pages: 256,
        description: "Ethan Mollick's practical argument that leaders who treat AI as a genuine collaborator — not merely a search engine — will be fundamentally more capable than those who don't. Concrete guidance on integrating AI into complex professional work without outsourcing judgment.",
        href: 'https://amzn.to/4dAMMo8',
      },
      {
        title: 'Generative AI for Leaders',
        author: 'Amir Husain',
        pages: 162,
        description: "A practical guide for commanders and executives on implementing AI-driven strategy — covering how generative AI works, where it creates competitive advantage, what risks it introduces, and how to build teams that can actually use it rather than just talk about it.",
        href: 'https://amzn.to/4eVWbcr',
      },
      {
        title: 'The Arms of the Future: Technology and Close Combat in the 21st Century',
        author: 'Jack Watling',
        pages: 258,
        description: "Jack Watling's ground-level survey of how drone warfare, precision munitions, electronic warfare, and AI are reshaping the close combat environment, written with direct access to units fighting in Ukraine. Essential reading for any leader who needs to understand what the next fight will actually look like on the ground.",
        href: 'https://amzn.to/4tOHJ9M',
      },
    ]),
  },
  {
    id: 'leadership',
    label: 'LEADERSHIP',
    kicker: 'LEAD PEOPLE WELL',
    description: 'Books focused on judgment, accountability, culture, and what leadership looks like when the mission is real and the stakes are human.',
    books: withDefaults([
      {
        title: 'Make Your Bed',
        author: 'Admiral William H. McRaven',
        pages: 144,
        description: "Admiral McRaven's ten lessons drawn from Navy SEAL training: small disciplines done consistently — starting with a made bed — compound into the habits that carry people through the worst days. A short book with an argument that every leader can apply before breakfast.",
        href: 'https://amzn.to/3R9ZRgV',
      },
      {
        title: 'You Are Worth It: Building a Life Worth Fighting For',
        author: 'Kyle Carpenter',
        pages: 320,
        description: "Medal of Honor recipient Kyle Carpenter's memoir of surviving a grenade that destroyed half his body, and the decade of recovery that followed. A raw account of purpose, grit, and the daily choice to rebuild — written by a Marine who learned what it means to earn your existence one day at a time.",
        href: 'https://amzn.to/4tIo1MY',
      },
      {
        title: 'The White Donkey: Terminal Lance',
        author: 'Maximilian Uriarte',
        pages: 288,
        description: "Uriarte's graphic novel follows a lance corporal through a deployment to Afghanistan, capturing the boredom, dark humor, camaraderie, and quiet moral damage of infantry service with an honesty that prose rarely achieves. Required reading for any leader who wants to understand what the junior enlisted Marine actually experiences.",
        href: 'https://amzn.to/4ukW2nz',
      },
      {
        title: 'On Killing',
        author: 'LtCol Dave Grossman',
        pages: 416,
        description: "Lt. Col. Dave Grossman's psychological examination of human resistance to killing in combat, how military training overcomes it, and what that conditioning costs warriors morally and psychologically. A foundational text for any leader who takes seriously the burden placed on every Marine they put in harm's way.",
        href: 'https://amzn.to/49cOCKG',
      },
      {
        title: 'Wisdom of the Bullfrog',
        author: 'Admiral William H. McRaven',
        pages: 224,
        description: "Admiral McRaven distills 37 years of Special Operations experience — from SEAL training to the Bin Laden mission — into lessons on decision-making under pressure, resilience after failure, and the habits that define extraordinary leaders when everything is on the line.",
        href: 'https://amzn.to/4dT6Zqz',
      },
      {
        title: 'Matterhorn: A Novel of the Vietnam War',
        author: 'Karl Marlantes',
        pages: 640,
        description: "Marlantes's semiautobiographical Vietnam novel set in the jungle highlands of I Corps, following a Marine platoon that fights its own command structure as much as the enemy. Dense, brutal, and widely regarded as the finest American novel of the Vietnam War — a meditation on leadership, loyalty, and the decisions that haunt officers for the rest of their lives.",
        href: 'https://amzn.to/4uPN5SY',
      },
      {
        title: 'The Yompers: With 45 Commando in the Falklands War',
        author: 'Ian R. Gardiner',
        pages: 224,
        description: "Company commander Ian Gardiner's account of 45 Commando's 8,000-mile sprint to the Falklands and the brutal yomp across its mountains — culminating in the successful night assault on Two Sisters. A book that combines frontline honesty with wider reflection on command, coalition warfare, and what it costs to keep a unit cohesive through a month of misery.",
        href: 'https://amzn.to/4dBhQEq',
      },
      {
        title: 'Generals and Admirals, Criminals and Crooks',
        author: 'Jeffrey Matthews',
        pages: 432,
        description: "Jeffrey Matthews's unflinching examination of military leadership failures across a century of American history — war crimes, moral cowardice, toxic command, obstruction of justice, and public corruption. Studying what went wrong, and why, gives leaders a sharper eye for the warning signs before they reach the point of no return.",
        href: 'https://amzn.to/4ugXY0p',
      },
      {
        title: 'Leadership Strategy and Tactics: Field Manual',
        author: 'Jocko Willink',
        pages: 352,
        description: "Jocko Willink's practical field manual for leaders at every level, translating Special Operations principles into concrete techniques for building trust, issuing clear guidance, managing up, and sustaining unit discipline without losing the team. Written like a reference — open it to any chapter and apply it the same day.",
        href: 'https://amzn.to/4tNqMwC',
      },
      {
        title: 'The Greatest U.S. Marine Corps Stories Ever Told',
        author: 'Iain C. Martin',
        pages: 320,
        description: "An anthology of firsthand accounts spanning the full arc of Marine Corps history — from the Halls of Montezuma through modern combat — gathering eyewitness voices and gripping narratives of service, sacrifice, and what it looks like to be a Marine when the situation is worst and the outcome is not yet decided.",
        href: 'https://amzn.to/4v2XmM2',
      },
      {
        title: 'Call Sign Chaos: Learning to Lead',
        author: 'Jim Mattis and Bing West',
        pages: 320,
        description: "Mattis and Bing West trace his trajectory from rifle platoon commander to CENTCOM, with each chapter revealing how he studied, mentored, and led — and how decades of serious reading shaped every major decision he made. A primer on developing strategic judgment through deliberate study, not simply time in grade.",
        href: 'https://amzn.to/42K4pwY',
      },
      {
        title: "Risk: A User's Guide",
        author: 'GEN (Ret.) Stanley McChrystal',
        pages: 368,
        description: "General McChrystal's framework for understanding and managing risk, built on the premise that risk cannot be eliminated — only understood, detected early, and managed. Practical tools for leaders who make high-stakes decisions under uncertainty and cannot afford to be surprised by what they should have seen coming.",
        href: 'https://amzn.to/3PSBBPQ',
      },
      {
        title: 'Nimitz at War',
        author: 'Craig L. Symonds',
        pages: 496,
        description: "Craig Symonds's command biography of Fleet Admiral Chester Nimitz, tracing how he rebuilt the Pacific Fleet after Pearl Harbor and managed strategy, logistics, and coalition warfare across the largest theater in military history. A study in calm, methodical command under conditions that would have broken most leaders.",
        href: 'https://amzn.to/4dzLHwX',
      },
      {
        title: 'Five Generations at Work: How We Win Together, For Good',
        author: 'Rebecca Robins and Patrick Dunne',
        pages: 272,
        description: "A research-backed framework for leading teams that span multiple generations, drawing on six years of global study to argue that generational diversity is a force multiplier when leaders move past stereotypes and actively unlock the different strengths each cohort brings. Particularly relevant as the Corps manages a workforce spanning Boomers to Gen Z.",
        href: 'https://amzn.to/4ugRdvr',
      },
      {
        title: 'Essentialism: The Disciplined Pursuit of Less',
        author: 'Greg McKeown',
        pages: 272,
        description: "McKeown's disciplined argument that high performers say no to almost everything and yes only to the vital few — and that this selectivity is not laziness but the most demanding form of leadership. Applies directly to how commanders allocate their attention, their unit's effort, and their subordinates' time.",
        href: 'https://amzn.to/42MiF8p',
      },
    ]),
  },
  {
    id: 'strategy',
    label: 'STRATEGY',
    kicker: 'THINK LONGER',
    description: 'A shelf for competition, campaigns, institutions, and the mental models that help leaders connect tactical decisions to strategic outcomes.',
    books: withDefaults([
      {
        title: 'The Closing of the American Mind',
        author: 'Allan Bloom',
        pages: 404,
        description: "Bloom's 1987 argument that American universities abandoned the pursuit of truth and the Western intellectual tradition, producing graduates incapable of serious moral reasoning. A provocative challenge for any officer who aspires to think clearly about values, duty, and what an education is actually for.",
        href: 'https://amzn.to/43i8QPH',
      },
      {
        title: "The Defence of Duffer's Drift",
        author: 'Ernest Dunlop Swinton',
        pages: 64,
        description: "A British subaltern's dream-structured parable in which a young officer repeatedly fails to defend a river crossing, learning a new tactical lesson with each nightmare. Written in 1904 and still one of the most effective tactical teaching tools ever produced — a reminder that small-unit fundamentals never go out of date.",
        href: 'https://amzn.to/4wzat93',
      },
      {
        title: "Ender's Game",
        author: 'Orson Scott Card',
        pages: 226,
        description: "A child prodigy is trained to command humanity's fleet against an alien invasion, but the real subject is the ethics of deception in warfare, the psychology of leadership under extreme pressure, and the moral cost of preparing warriors who win wars they don't fully understand. A thought experiment that military readers never quite finish arguing about.",
        href: 'https://amzn.to/42JncZe',
      },
      {
        title: 'Legacy: 15 Lessons in Leadership',
        author: 'James Kerr',
        pages: 224,
        description: "James Kerr's study of the All Blacks' culture — relentless standards, servant leadership, and the requirement that every player sweeps the sheds before leaving — as a framework for how elite organizations sustain excellence across generations. The lesson is not about rugby: it's about what it takes to never let the standard slip.",
        href: 'https://amzn.to/4tJjQjO',
      },
      {
        title: 'The Infinite Game',
        author: 'Simon Sinek',
        pages: 272,
        description: "Sinek argues that most leaders play with a finite mindset in an inherently infinite game — optimizing for the next win instead of sustaining the cause that outlasts them. The shift from short-term winning to long-term institutional health separates organizations that endure from those that collapse under their own success.",
        href: 'https://amzn.to/4uRsMVk',
      },
      {
        title: 'Turn the Ship Around!: A True Story of Turning Followers into Leaders',
        author: 'L. David Marquet',
        pages: 272,
        description: "David Marquet's account of transforming the USS Santa Fe from the worst-performing submarine in the fleet to the best by pushing decision-making authority down to the level where information actually lives. The definitive case study for any commander who wants initiative from subordinates rather than compliance.",
        href: 'https://amzn.to/4dSPw1x',
      },
      {
        title: 'On Grand Strategy',
        author: 'John Lewis Gaddis',
        pages: 384,
        description: "Gaddis synthesizes centuries of strategic thought — from Thucydides and Sun Tzu to Lincoln and FDR — to argue that the greatest leaders throughout history shared one rare ability: they could hold enormous ends and severely limited means in their minds simultaneously, without breaking. Required reading for anyone who makes decisions where the stakes outlast the moment.",
        href: 'https://amzn.to/49cbfPv',
      },
      {
        title: "Speed Kills: Leveraging John Boyd's OODA Loop to Build Organizations That Win",
        author: 'Alex Vohr',
        pages: 282,
        description: "Alex Vohr applies Boyd's OODA loop to organizational leadership, showing how faster observe-orient-decide-act cycles create competitive advantages in both warfare and complex organizations. Practical guidance for translating Boyd's theory — which the Corps helped create — into daily decision-making habits.",
        href: 'https://amzn.to/42Olh5E',
      },
      {
        title: 'The New Makers of Modern Strategy: From the Ancient World to the Digital Age',
        author: 'Edited by Hal Brands',
        pages: 1200,
        description: "Hal Brands's comprehensive update to the canonical Makers of Modern Strategy, assembling leading scholars to trace how strategic thought has evolved from antiquity through the digital age. A graduate-level survey in a single volume — the closest thing the field has to a complete map of how strategy works and where it has gone wrong.",
        href: 'https://amzn.to/4dUkRRm',
      },
      {
        title: 'Ground Combat: Puncturing the Myths of Modern War',
        author: 'Ben Connable',
        pages: 352,
        description: "Ben Connable's evidence-based challenge to the claim that new technology is transforming land warfare beyond recognition. Drawing on 468 ground combat cases from WWII through 2022, he shows that tanks, artillery, infantry, terrain, and the fog of war remain as central to modern combat as they were in 1944 — a corrective for anyone who has confused sensor range for tactical advantage.",
        href: 'https://amzn.to/4eWNazQ',
      },
      {
        title: "The Generals' War: The Inside Story of the Conflict in the Gulf",
        author: 'Michael Gordon and Bernard Trainor',
        pages: 576,
        description: "Gordon and Trainor's inside account of Gulf War command decisions — the debates between Schwarzkopf, Powell, and Washington — and whether the decision to stop short of Baghdad reflected strategic wisdom or an opportunity left on the table. A study in how political constraints shape military operations whether commanders acknowledge it or not.",
        href: 'https://amzn.to/4tLZt5F',
      },
      {
        title: 'Command: The Politics of Military Operations from Korea to Ukraine',
        author: 'Lawrence Freedman',
        pages: 624,
        description: "Lawrence Freedman traces political-military command relationships across seven decades of conflict, examining how civilian leaders and military commanders share authority, manage disagreement, and — occasionally — build enough trust to actually win. Essential reading for any officer who wants to understand the environment above the operational level.",
        href: 'https://amzn.to/4uVIRJw',
      },
      {
        title: 'The Russian Way of Deterrence: Strategic Culture, Coercion & War',
        author: 'Dmitry Adamsky',
        pages: 226,
        description: "Dmitry Adamsky's analysis of how Russian strategic culture shapes Moscow's approach to nuclear signaling, escalation management, and coercive deterrence — providing the conceptual framework for understanding Russian behavior in Ukraine and the logic behind its most dangerous decisions.",
        href: 'https://amzn.to/4ulxJpt',
      },
      {
        title: "The Long Game: China's Grand Strategy to Displace American Order",
        author: 'Rush Doshi',
        pages: 432,
        description: "Rush Doshi draws on Chinese-language sources to argue that Beijing has pursued a deliberate, multi-decade grand strategy to displace American order — and documents precisely how that strategy is being implemented across military, economic, and institutional domains. The clearest single account of what the pacing threat is actually doing.",
        href: 'https://amzn.to/4eVYZGv',
      },
      {
        title: 'Fleet Tactics and Naval Operations, 3rd ed.',
        author: 'Wayne Hughes and Robert Girrier',
        pages: 408,
        description: "The definitive text on how naval forces fight at the operational and tactical level — covering salvo models, the enduring tension between concentration and dispersal, and the principles that govern surface and air combat at sea. Essential for any Marine who operates in a maritime environment and needs to understand the naval force they work alongside.",
        href: 'https://amzn.to/4uWFGBx',
      },
      {
        title: 'Chinese Amphibious Warfare: Prospects for a Cross-Straits Invasion',
        author: 'Andrew Erickson, Conor Kennedy, and Ryan Martinson',
        description: "A Naval War College Press volume examining the PLA's progress toward a cross-Strait invasion capability, evaluating Xi Jinping's 2027 military goal, and assessing what Taiwan — with American support — must do urgently to shore up deterrence. Named 2025 Publication of the Year by the Samuel B. Griffith Foundation.",
        kind: 'pdf',
        href: '/reading/chinese-amphibious-warfare.pdf',
      },
    ]),
  },
  {
    id: 'foundation',
    label: 'FOUNDATION',
    kicker: 'DOCTRINE FIRST',
    description: 'The publications that establish the baseline: constitutional grounding, warfighting philosophy, and the doctrinal language Marines are expected to know.',
    books: withDefaults([
      {
        title: 'Constitution of the United States of America',
        author: 'James Madison et al.',
        pages: 16,
        description: 'The foundational legal document every Marine swears to support and defend — particularly Articles I and II, which define the war powers divided between Congress and the Commander in Chief that govern every use of military force. Know what you swore to protect.',
        kind: 'pdf',
        href: '/reading/constitution-of-united-states.pdf',
      },
      {
        title: 'Warfighting (MCDP 1)',
        author: 'United States Marine Corps',
        pages: 103,
        description: "The capstone of Marine Corps doctrine: the philosophy of maneuver warfare, the moral, mental, and physical dimensions of war, and the principles that shape every other publication the Corps produces. Read this first. Return to it after every deployment.",
        kind: 'pdf',
        href: '/reading/MCDP-1-Warfighting-GN.pdf',
      },
      {
        title: 'Competing (MCDP 1-4)',
        author: 'United States Marine Corps',
        pages: 68,
        description: "The Marine Corps' doctrinal framework for operating below the threshold of armed conflict — where the preponderance of strategic competition with peer adversaries is actually conducted, and where most Marines will spend the majority of their careers.",
        kind: 'pdf',
        href: '/reading/MCDP-1-4.pdf',
      },
      {
        title: 'Intelligence (MCDP 2)',
        author: 'United States Marine Corps',
        pages: 116,
        description: "Establishes the doctrinal principles governing Marine intelligence operations, with emphasis on the intelligence-operations relationship and the commander's direct role in driving the intelligence cycle — not passively waiting for finished products.",
        kind: 'pdf',
        href: '/reading/MCDP-2.pdf',
      },
      {
        title: 'Expeditionary Operations (MCDP 3)',
        author: 'United States Marine Corps',
        pages: 109,
        description: "Defines the Marine Corps' expeditionary mindset — the ability to deploy rapidly, operate with austere logistics, and project combat power ashore — and the operational principles that distinguish a force-in-readiness from a garrison force. The doctrinal case for why the Corps exists the way it does.",
        kind: 'pdf',
        href: '/reading/MCDP-3.pdf',
      },
      {
        title: 'Logistics (MCDP 4)',
        author: 'United States Marine Corps',
        pages: 103,
        description: "The doctrinal foundation for sustaining Marine forces across the full range of military operations, articulating how logistics shapes operational design and why no plan survives contact with its own supply chain without deliberate planning from the start.",
        kind: 'pdf',
        href: '/reading/MCDP-4-1.pdf',
      },
      {
        title: 'Learning (MCDP 7)',
        author: 'United States Marine Corps',
        pages: 82,
        description: "The Marine Corps' framework for institutional and individual learning, arguing that adaptive organizations must build cultures that capture and apply lessons faster than their adversaries. The doctrinal case that intellectual development is a warfighting requirement, not a peacetime luxury.",
        kind: 'pdf',
        href: '/reading/MCDP-7-3.pdf',
      },
      {
        title: 'Leading Marines (MCWP 6-11)',
        author: 'United States Marine Corps',
        pages: 153,
        description: "The foundational leadership doctrine of the Corps — what it means to lead people rather than manage resources, grounded in Honor, Courage, and Commitment. Written for leaders at every grade; relevant on the first day of command and the last.",
        kind: 'pdf',
        href: '/reading/MCWP-6-11-Leading-Marines.pdf',
      },
      {
        title: 'Sustaining the Transformation (MCRP 6-11D)',
        author: 'United States Marine Corps',
        pages: 82,
        description: "Companion to Leading Marines, focused on how Marines sustain the character and values forged in recruit training throughout a career — and how NCOs and officers model, reinforce, and protect that culture in the units they lead. The doctrinal answer to the question of what happens after the transformation.",
        kind: 'pdf',
        href: '/reading/MCRP-6-11D.pdf',
      },
    ]),
  },
];

export const featuredTitles = [
  'Code Talker: The First and Only Memoir by One of the Original Navajo Code Talkers of WWII',
  "Echo in Ramadi: The Firsthand Story of US Marines in Iraq's Deadliest City",
  'The American War in Afghanistan: A History',
] as const;
