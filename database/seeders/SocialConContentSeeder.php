<?php

namespace Database\Seeders;

use App\Models\Addon;
use App\Models\AgendaDay;
use App\Models\AgendaItem;
use App\Models\AttendPersona;
use App\Models\AwardCategory;
use App\Models\Hotel;
use App\Models\LeaderMessage;
use App\Models\Nominee;
use App\Models\Speaker;
use App\Models\Sponsor;
use App\Models\SponsorTier;
use App\Models\Testimonial;
use App\Models\TicketTier;
use Illuminate\Database\Seeder;

class SocialConContentSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedSponsors();
        $this->seedSpeakers();
        $this->seedAgenda();
        $this->seedAwards();
        $this->seedTestimonials();
        $this->seedLeaderMessages();
        $this->seedAttendPersonas();
        $this->seedTicketing();
    }

    private function seedSponsors(): void
    {
        $tiers = [
            'title' => ['sort' => 0, 'name' => ['en' => 'Title', 'am' => 'ዋና ስፖንሰር', 'fr' => 'Titre']],
            'platinum' => ['sort' => 1, 'name' => ['en' => 'Platinum', 'am' => 'ፕላቲነም', 'fr' => 'Platine']],
            'gold' => ['sort' => 2, 'name' => ['en' => 'Gold', 'am' => 'ወርቅ', 'fr' => 'Or']],
            'supporting' => ['sort' => 3, 'name' => ['en' => 'Supporting', 'am' => 'ደጋፊ', 'fr' => 'Soutien']],
        ];

        $tierIds = [];

        foreach ($tiers as $slug => $tier) {
            $tierIds[$slug] = SponsorTier::updateOrCreate(
                ['slug' => $slug],
                ['name' => $tier['name'], 'sort_order' => $tier['sort']],
            )->id;
        }

        $sponsors = [
            ['afdb', 'title', 'African Development Bank', 'https://www.afdb.org/en', [
                'en' => 'Driving sustainable economic development across Africa.',
                'am' => 'በመላው አፍሪካ ዘላቂ የኢኮኖሚ ልማትን የሚያራምድ።',
                'fr' => "Moteur du développement économique durable à travers l'Afrique.",
            ]],
            ['au-commission', 'title', 'African Union Commission', 'https://au.int/', [
                'en' => "Leading Africa's integration and development agenda.",
                'am' => 'የአፍሪካን ውህደትና የልማት አጀንዳ የሚመራ።',
                'fr' => "À la tête de l'agenda d'intégration et de développement de l'Afrique.",
            ]],
            ['mtn', 'platinum', 'MTN Group', 'https://www.mtn.com/', [
                'en' => "Africa's largest mobile network operator.",
                'am' => 'የአፍሪካ ትልቁ የሞባይል ኔትወርክ አገልግሎት ሰጪ።',
                'fr' => "Le plus grand opérateur de réseau mobile d'Afrique.",
            ]],
            ['safaricom', 'platinum', 'Safaricom', 'https://www.safaricom.co.ke/', [
                'en' => "Kenya's leading communications company.",
                'am' => 'የኬንያ ቀዳሚ የመገናኛ ኩባንያ።',
                'fr' => 'La première entreprise de communications du Kenya.',
            ]],
            ['standard-bank', 'gold', 'Standard Bank', 'https://www.standardbank.com/sbg/standard-bank-group', [
                'en' => "Africa's largest bank by assets.",
                'am' => 'በንብረት መጠን የአፍሪካ ትልቁ ባንክ።',
                'fr' => "La plus grande banque d'Afrique par ses actifs.",
            ]],
            ['undp-africa', 'supporting', 'UNDP Africa', 'https://www.undp.org/africa', [
                'en' => 'Supporting sustainable development in Africa.',
                'am' => 'በአፍሪካ ዘላቂ ልማትን የሚደግፍ።',
                'fr' => 'Soutien au développement durable en Afrique.',
            ]],
        ];

        foreach ($sponsors as $i => [$slug, $tierSlug, $name, $url, $description]) {
            Sponsor::updateOrCreate(['slug' => $slug], [
                'sponsor_tier_id' => $tierIds[$tierSlug],
                'name' => $name,
                'description' => $description,
                'url' => $url,
                'logo_path' => "/image/sponsors/{$slug}.png",
                'sort_order' => $i,
            ]);
        }
    }

    private function seedSpeakers(): void
    {
        $speakers = [
            ['fatima-al-rashid', 'Fatima Al-Rashid', 'creator_economy', [
                'en' => 'Content Creator & Influencer',
                'am' => 'የይዘት ፈጣሪ እና ኢንፍሉዌንሰር',
                'fr' => 'Créatrice de contenu et influenceuse',
            ], '/template/img/all-images/team/team-img7.png'],
            ['joseph-mutamba', 'Hon. Joseph Mutamba', 'policy', [
                'en' => 'Minister of Digital Economy',
                'am' => 'የዲጂታል ኢኮኖሚ ሚኒስትር',
                'fr' => "Ministre de l'Économie numérique",
            ], '/template/img/all-images/team/team-img6.png'],
            ['kwame-asante', 'Kwame Asante', 'business', [
                'en' => 'Founder & CEO',
                'am' => 'መሥራች እና ዋና ሥራ አስፈጻሚ',
                'fr' => 'Fondateur et PDG',
            ], '/template/img/all-images/team/team-img8.png'],
            ['zara-ncube', 'Zara Ncube', 'technology', [
                'en' => 'Social Media Strategist',
                'am' => 'የማህበራዊ ሚዲያ ስትራቴጂስት',
                'fr' => 'Stratège des réseaux sociaux',
            ], '/template/img/all-images/team/team-img9.png'],
        ];

        foreach ($speakers as $i => [$slug, $name, $category, $role, $photo]) {
            Speaker::updateOrCreate(['slug' => $slug], [
                'name' => $name,
                'role' => $role,
                'category' => $category,
                'photo_path' => $photo,
                'is_featured' => true,
                'sort_order' => $i,
            ]);
        }
    }

    private function seedAgenda(): void
    {
        $day = AgendaDay::updateOrCreate(
            ['date' => '2026-10-24'],
            [
                'label' => ['en' => 'Day 1 — October 24', 'am' => 'ቀን 1 — ጥቅምት 24', 'fr' => 'Jour 1 — 24 octobre'],
                'title' => ['en' => 'Creator Economy Revolution', 'am' => 'የፈጣሪ ኢኮኖሚ አብዮት', 'fr' => "La révolution de l'économie des créateurs"],
                'sort_order' => 0,
            ],
        );

        $items = [
            ['08:00', '09:00', 'ceremony', null, null,
                ['en' => 'Registration & Welcome Reception', 'am' => 'ምዝገባ እና የእንኳን ደህና መጣችሁ አቀባበል', 'fr' => 'Enregistrement et réception de bienvenue'],
                ['en' => 'Check-in and networking with welcome refreshments', 'am' => 'መግቢያ ምዝገባ እና ከመክሰስ ጋር መተዋወቅ', 'fr' => 'Enregistrement et réseautage avec rafraîchissements de bienvenue'],
                ['en' => 'Main Lobby', 'am' => 'ዋና መግቢያ አዳራሽ', 'fr' => 'Hall principal']],
            ['09:00', '09:30', 'ceremony', null, 'Various Dignitaries',
                ['en' => 'Opening Ceremony', 'am' => 'የመክፈቻ ሥነ ሥርዓት', 'fr' => "Cérémonie d'ouverture"],
                ['en' => 'Welcome remarks from African leaders and organizers', 'am' => 'ከአፍሪካ መሪዎችና አዘጋጆች የእንኳን ደህና መጣችሁ ንግግር', 'fr' => 'Mots de bienvenue des dirigeants africains et des organisateurs'],
                ['en' => 'Main Auditorium', 'am' => 'ዋና አዳራሽ', 'fr' => 'Auditorium principal']],
            ['09:30', '11:00', 'keynote', 'creator_economy', 'Dr. Amara Okafor',
                ['en' => 'Keynote: The African Creator Economy Revolution', 'am' => 'ቁልፍ ንግግር፡ የአፍሪካ የፈጣሪ ኢኮኖሚ አብዮት', 'fr' => "Discours d'ouverture : la révolution de l'économie des créateurs africains"],
                ['en' => "Exploring the future of Africa's digital content creation", 'am' => 'የአፍሪካ ዲጂታል ይዘት ፈጠራ የወደፊት ጉዞ ዳሰሳ', 'fr' => "Explorer l'avenir de la création de contenu numérique en Afrique"],
                ['en' => 'Creator Hall', 'am' => 'የፈጣሪዎች አዳራሽ', 'fr' => 'Salle des créateurs']],
            ['11:00', '11:30', 'break', null, null,
                ['en' => 'Networking Break', 'am' => 'የመተዋወቂያ እረፍት', 'fr' => 'Pause réseautage'],
                ['en' => 'Coffee and networking opportunities', 'am' => 'ቡና እና የመተዋወቅ እድሎች', 'fr' => 'Café et opportunités de réseautage'],
                ['en' => 'Exhibition Area', 'am' => 'የኤግዚቢሽን ስፍራ', 'fr' => "Espace d'exposition"]],
            ['11:30', '13:00', 'panel', 'creator_economy', 'Fatima Al-Rashid & Panel',
                ['en' => 'Panel: Building Creator Economies Across Africa', 'am' => 'ውይይት፡ በመላው አፍሪካ የፈጣሪ ኢኮኖሚዎችን መገንባት', 'fr' => "Panel : bâtir les économies des créateurs à travers l'Afrique"],
                ['en' => 'Strategies for creators to monetize and scale', 'am' => 'ፈጣሪዎች ገቢ ለማግኘትና ለማደግ የሚጠቀሙባቸው ስትራቴጂዎች', 'fr' => 'Stratégies de monétisation et de croissance pour les créateurs'],
                ['en' => 'Creator Hall', 'am' => 'የፈጣሪዎች አዳራሽ', 'fr' => 'Salle des créateurs']],
            ['13:00', '14:30', 'break', null, null,
                ['en' => 'Networking Lunch', 'am' => 'የመተዋወቂያ ምሳ', 'fr' => 'Déjeuner réseautage'],
                ['en' => 'Networking lunch with African cuisine', 'am' => 'ከአፍሪካ ምግቦች ጋር የመተዋወቂያ ምሳ', 'fr' => 'Déjeuner réseautage avec cuisine africaine'],
                ['en' => 'Grand Dining Hall', 'am' => 'ታላቁ የመመገቢያ አዳራሽ', 'fr' => 'Grande salle à manger']],
            ['14:30', '16:00', 'workshop', 'business', 'Kwame Asante',
                ['en' => 'Business Transformation Workshop', 'am' => 'የቢዝነስ ለውጥ ወርክሾፕ', 'fr' => 'Atelier de transformation des entreprises'],
                ['en' => 'Leveraging the creator economy for brand growth', 'am' => 'የፈጣሪ ኢኮኖሚን ለብራንድ እድገት መጠቀም', 'fr' => "Tirer parti de l'économie des créateurs pour la croissance des marques"],
                ['en' => 'Business Center', 'am' => 'የቢዝነስ ማዕከል', 'fr' => "Centre d'affaires"]],
            ['16:00', '16:30', 'break', null, null,
                ['en' => 'Afternoon Break', 'am' => 'የከሰዓት እረፍት', 'fr' => "Pause de l'après-midi"],
                ['en' => 'Refreshments and networking', 'am' => 'መክሰስ እና መተዋወቅ', 'fr' => 'Rafraîchissements et réseautage'],
                ['en' => 'Exhibition Area', 'am' => 'የኤግዚቢሽን ስፍራ', 'fr' => "Espace d'exposition"]],
            ['16:30', '18:00', 'panel', 'policy', 'Hon. Joseph Mutamba',
                ['en' => 'Policy Framework Roundtable', 'am' => 'የፖሊሲ ማዕቀፍ ክብ ጠረጴዛ ውይይት', 'fr' => 'Table ronde sur le cadre politique'],
                ['en' => 'Discussing digital policies for creator economies', 'am' => 'ለፈጣሪ ኢኮኖሚዎች የዲጂታል ፖሊሲዎች ውይይት', 'fr' => 'Discussion sur les politiques numériques pour les économies des créateurs'],
                ['en' => 'Policy Forum', 'am' => 'የፖሊሲ መድረክ', 'fr' => 'Forum politique']],
            ['19:00', '23:00', 'ceremony', null, null,
                ['en' => 'African Influencer Awards Gala Night', 'am' => 'የአፍሪካ ኢንፍሉዌንሰር ሽልማት ጋላ ምሽት', 'fr' => 'Soirée de gala des African Influencer Awards'],
                ['en' => "Celebrating Africa's top creators with awards and performances", 'am' => 'የአፍሪካን ምርጥ ፈጣሪዎች በሽልማትና በትርኢት ማክበር', 'fr' => "Célébration des meilleurs créateurs d'Afrique avec remises de prix et spectacles"],
                ['en' => 'Grand Ballroom', 'am' => 'ታላቁ አዳራሽ', 'fr' => 'Grande salle de bal']],
        ];

        foreach ($items as $i => [$start, $end, $kind, $track, $speaker, $title, $description, $location]) {
            AgendaItem::updateOrCreate(
                ['agenda_day_id' => $day->id, 'starts_at' => $start],
                [
                    'ends_at' => $end,
                    'kind' => $kind,
                    'track' => $track,
                    'title' => $title,
                    'description' => $description,
                    'location' => $location,
                    'speaker_name' => $speaker,
                    'sort_order' => $i,
                ],
            );
        }
    }

    private function seedAwards(): void
    {
        $categories = [
            ['creator-of-the-year', 'fa-solid fa-trophy',
                ['en' => 'Creator of the Year', 'am' => 'የዓመቱ ፈጣሪ', 'fr' => "Créateur de l'année"],
                ['en' => 'Recognizing the most impactful creator across all platforms and industries', 'am' => 'በሁሉም መድረኮችና ኢንዱስትሪዎች ከፍተኛ ተጽዕኖ ያሳደረውን ፈጣሪ እውቅና መስጠት', 'fr' => 'Récompense le créateur le plus influent, toutes plateformes et industries confondues']],
            ['rising-star', 'fa-solid fa-star',
                ['en' => 'Rising Star', 'am' => 'ወጣት ኮከብ', 'fr' => 'Étoile montante'],
                ['en' => 'Celebrating emerging creators with exceptional growth and potential', 'am' => 'ልዩ እድገትና አቅም ያላቸውን አዳዲስ ፈጣሪዎች ማክበር', 'fr' => 'Célèbre les créateurs émergents à la croissance et au potentiel exceptionnels']],
            ['best-brand-partnership', 'fa-solid fa-handshake',
                ['en' => 'Best Brand Partnership', 'am' => 'ምርጥ የብራንድ አጋርነት', 'fr' => 'Meilleur partenariat de marque'],
                ['en' => 'Outstanding collaboration between creators and brands', 'am' => 'በፈጣሪዎችና በብራንዶች መካከል የላቀ ትብብር', 'fr' => 'Collaboration exceptionnelle entre créateurs et marques']],
            ['social-impact', 'fa-solid fa-heart',
                ['en' => 'Social Impact', 'am' => 'ማህበራዊ ተጽዕኖ', 'fr' => 'Impact social'],
                ['en' => 'Creators using their influence for positive social change', 'am' => 'ተጽዕኗቸውን ለበጎ ማህበራዊ ለውጥ የሚጠቀሙ ፈጣሪዎች', 'fr' => 'Créateurs utilisant leur influence pour un changement social positif']],
            ['educational-content', 'fa-solid fa-graduation-cap',
                ['en' => 'Educational Content', 'am' => 'ትምህርታዊ ይዘት', 'fr' => 'Contenu éducatif'],
                ['en' => 'Excellence in educational and informative content creation', 'am' => 'በትምህርታዊና መረጃ ሰጪ ይዘት ፈጠራ የላቀ ብቃት', 'fr' => 'Excellence dans la création de contenu éducatif et informatif']],
            ['pan-african-unity', 'fa-solid fa-globe',
                ['en' => 'Pan-African Unity', 'am' => 'ፓን-አፍሪካዊ አንድነት', 'fr' => 'Unité panafricaine'],
                ['en' => 'Promoting cultural exchange and continental collaboration', 'am' => 'የባህል ልውውጥንና አህጉራዊ ትብብርን ማስፋፋት', 'fr' => 'Promotion des échanges culturels et de la collaboration continentale']],
        ];

        $placeholderNominees = [
            ['Amara Tesfaye', 'Ethiopia'],
            ['Chidi Okonkwo', 'Nigeria'],
            ['Naledi Dlamini', 'South Africa'],
        ];

        $photos = [
            '/template/img/all-images/team/team-img6.png',
            '/template/img/all-images/team/team-img7.png',
            '/template/img/all-images/team/team-img8.png',
        ];

        foreach ($categories as $i => [$slug, $icon, $name, $description]) {
            $category = AwardCategory::updateOrCreate(['slug' => $slug], [
                'name' => $name,
                'description' => $description,
                'icon' => $icon,
                'sort_order' => $i,
            ]);

            foreach ($placeholderNominees as $j => [$nomineeName, $country]) {
                Nominee::updateOrCreate(
                    ['award_category_id' => $category->id, 'name' => $nomineeName],
                    [
                        'country' => $country,
                        'photo_path' => $photos[$j % count($photos)],
                        'status' => 'published',
                        'sort_order' => $j,
                    ],
                );
            }
        }
    }

    private function seedTestimonials(): void
    {
        $testimonials = [
            ['Sarah M.',
                ['en' => 'Content Creator, Creative Pulse', 'am' => 'የይዘት ፈጣሪ፣ Creative Pulse', 'fr' => 'Créatrice de contenu, Creative Pulse'],
                ['en' => 'Kenya', 'am' => 'ኬንያ', 'fr' => 'Kenya'],
                ['en' => 'Socialcon Africa transformed my approach to content creation, connecting me with industry leaders and innovative strategies.',
                    'am' => 'ሶሻልኮን አፍሪካ የይዘት ፈጠራ አካሄዴን ቀይሮ ከኢንዱስትሪ መሪዎችና ከአዳዲስ ስትራቴጂዎች ጋር አገናኝቶኛል።',
                    'fr' => 'Socialcon Africa a transformé mon approche de la création de contenu, en me connectant à des leaders du secteur et à des stratégies innovantes.']],
            ['Michael O.',
                ['en' => 'Tech Entrepreneur, Innovate Africa', 'am' => 'የቴክኖሎጂ ሥራ ፈጣሪ፣ Innovate Africa', 'fr' => 'Entrepreneur tech, Innovate Africa'],
                ['en' => 'Nigeria', 'am' => 'ናይጄሪያ', 'fr' => 'Nigéria'],
                ['en' => "The networking opportunities at Socialcon were unparalleled. I found partners who share my vision for Africa's digital future.",
                    'am' => 'በሶሻልኮን የነበሩት የመተዋወቅ እድሎች ወደር የላቸውም። ለአፍሪካ ዲጂታል የወደፊት ጉዞ ራዕዬን የሚጋሩ አጋሮችን አግኝቻለሁ።',
                    'fr' => "Les opportunités de réseautage à Socialcon étaient inégalées. J'ai trouvé des partenaires qui partagent ma vision de l'avenir numérique de l'Afrique."]],
            ['Aisha K.',
                ['en' => 'Digital Marketer, BrandSync Africa', 'am' => 'ዲጂታል ማርኬተር፣ BrandSync Africa', 'fr' => 'Marketeuse digitale, BrandSync Africa'],
                ['en' => 'South Africa', 'am' => 'ደቡብ አፍሪካ', 'fr' => 'Afrique du Sud'],
                ['en' => "The insights from Socialcon's speakers helped me refine my marketing campaigns and boost engagement significantly.",
                    'am' => 'ከሶሻልኮን ተናጋሪዎች ያገኘኋቸው ግንዛቤዎች የማርኬቲንግ ዘመቻዎቼን እንዳሻሽልና ተሳትፎን በከፍተኛ ደረጃ እንዳሳድግ ረድተውኛል።',
                    'fr' => "Les enseignements des intervenants de Socialcon m'ont aidée à affiner mes campagnes marketing et à augmenter significativement l'engagement."]],
        ];

        foreach ($testimonials as $i => [$name, $role, $country, $quote]) {
            Testimonial::updateOrCreate(['author_name' => $name], [
                'role' => $role,
                'country' => $country,
                'quote' => $quote,
                'sort_order' => $i,
            ]);
        }
    }

    private function seedLeaderMessages(): void
    {
        $leaders = [
            ['H.E. Dr. Abiy Ahmed',
                ['en' => 'Prime Minister of Ethiopia', 'am' => 'የኢትዮጵያ ጠቅላይ ሚኒስትር', 'fr' => "Premier ministre d'Éthiopie"],
                ['en' => 'To thrive in the digital economy, we must support innovators and build strong digital enablers. We aim to position Ethiopia as a leader in Africa\'s digital economy, encouraging global partnerships.',
                    'am' => 'በዲጂታል ኢኮኖሚ ለማደግ ፈጣሪዎችን መደገፍና ጠንካራ የዲጂታል አስቻይ ሁኔታዎችን መገንባት አለብን። ኢትዮጵያን በአፍሪካ ዲጂታል ኢኮኖሚ መሪ ለማድረግ እየሠራን ሲሆን ዓለም አቀፍ አጋርነቶችንም እናበረታታለን።',
                    'fr' => "Pour prospérer dans l'économie numérique, nous devons soutenir les innovateurs et bâtir de solides catalyseurs numériques. Nous voulons positionner l'Éthiopie comme un leader de l'économie numérique africaine, en encourageant les partenariats mondiaux."],
                '/image/leaders/abiy-ahmed.jpg'],
            ['H.E. Moussa Faki Mahamat',
                ['en' => 'Chairperson, African Union Commission', 'am' => 'የአፍሪካ ህብረት ኮሚሽን ሊቀመንበር', 'fr' => "Président de la Commission de l'Union africaine"],
                ['en' => "In this vision, digitalization forms the top of our priorities. Across education, healthcare, trade and governance, digital media and technologies are central to unlocking Africa's potential. We must harness these tools not only to bridge the digital divide—but to tell our stories, connect our voices, and drive transformative change across the Continent.",
                    'am' => 'በዚህ ራዕይ ውስጥ ዲጂታላይዜሽን ከቅድሚያ ቅድሚያ የምንሰጣቸው ጉዳዮች አንዱ ነው። በትምህርት፣ በጤና፣ በንግድና በአስተዳደር ዘርፎች ዲጂታል ሚዲያና ቴክኖሎጂዎች የአፍሪካን አቅም ለመክፈት ማዕከላዊ ናቸው። እነዚህን መሣሪያዎች የዲጂታል ክፍተትን ለመሙላት ብቻ ሳይሆን ታሪኮቻችንን ለመንገር፣ ድምጾቻችንን ለማገናኘትና በአህጉሪቱ ለውጥ ለማምጣት መጠቀም አለብን።',
                    'fr' => "Dans cette vision, la numérisation figure au sommet de nos priorités. Dans l'éducation, la santé, le commerce et la gouvernance, les médias et technologies numériques sont essentiels pour libérer le potentiel de l'Afrique. Nous devons exploiter ces outils non seulement pour combler la fracture numérique, mais aussi pour raconter nos histoires, connecter nos voix et impulser un changement transformateur à travers le continent."],
                '/image/leaders/moussa-faki.jpg'],
        ];

        foreach ($leaders as $i => [$name, $title, $quote, $photo]) {
            LeaderMessage::updateOrCreate(['name' => $name], [
                'title' => $title,
                'quote' => $quote,
                'photo_path' => $photo,
                'sort_order' => $i,
            ]);
        }
    }

    private function seedAttendPersonas(): void
    {
        $personas = [
            ['fa-solid fa-video',
                ['en' => 'Content Creators', 'am' => 'የይዘት ፈጣሪዎች', 'fr' => 'Créateurs de contenu'],
                ['en' => 'Vloggers, bloggers, artists, and storytellers looking to refine their craft and expand their reach.',
                    'am' => 'ሙያቸውን ለማሻሻልና ተደራሽነታቸውን ለማስፋት የሚፈልጉ ቪሎገሮች፣ ብሎገሮች፣ አርቲስቶችና ታሪክ ተራኪዎች።',
                    'fr' => 'Vlogueurs, blogueurs, artistes et conteurs souhaitant perfectionner leur art et élargir leur audience.']],
            ['fa-solid fa-bullhorn',
                ['en' => 'Digital Marketers', 'am' => 'ዲጂታል ማርኬተሮች', 'fr' => 'Marketeurs digitaux'],
                ['en' => 'Professionals seeking the latest trends in social media, influencer marketing, and brand strategy.',
                    'am' => 'በማህበራዊ ሚዲያ፣ በኢንፍሉዌንሰር ማርኬቲንግና በብራንድ ስትራቴጂ የቅርብ ጊዜ አዝማሚያዎችን የሚፈልጉ ባለሙያዎች።',
                    'fr' => "Professionnels à la recherche des dernières tendances en réseaux sociaux, marketing d'influence et stratégie de marque."]],
            ['fa-solid fa-briefcase',
                ['en' => 'Business Owners', 'am' => 'የንግድ ባለቤቶች', 'fr' => "Chefs d'entreprise"],
                ['en' => 'Entrepreneurs aiming to leverage social media to grow their brand and connect with customers.',
                    'am' => 'ብራንዳቸውን ለማሳደግና ከደንበኞች ጋር ለመገናኘት ማህበራዊ ሚዲያን መጠቀም የሚፈልጉ ሥራ ፈጣሪዎች።',
                    'fr' => 'Entrepreneurs souhaitant exploiter les réseaux sociaux pour développer leur marque et se connecter à leurs clients.']],
            ['fa-solid fa-code',
                ['en' => 'Tech Innovators', 'am' => 'የቴክኖሎጂ ፈጣሪዎች', 'fr' => 'Innovateurs tech'],
                ['en' => 'Developers and tech enthusiasts building the next generation of digital platforms and tools.',
                    'am' => 'የሚቀጥለውን ትውልድ ዲጂታል መድረኮችና መሣሪያዎች የሚገነቡ ገንቢዎችና የቴክኖሎጂ ወዳጆች።',
                    'fr' => 'Développeurs et passionnés de tech construisant la prochaine génération de plateformes et outils numériques.']],
            ['fa-solid fa-landmark',
                ['en' => 'Policy Makers', 'am' => 'ፖሊሲ አውጪዎች', 'fr' => 'Décideurs politiques'],
                ['en' => 'Government and NGO leaders shaping the digital landscape and creative economy in Africa.',
                    'am' => 'በአፍሪካ የዲጂታል ምህዳሩንና የፈጠራ ኢኮኖሚውን የሚቀርጹ የመንግሥትና የመንግሥታዊ ያልሆኑ ድርጅቶች መሪዎች።',
                    'fr' => "Dirigeants gouvernementaux et d'ONG façonnant le paysage numérique et l'économie créative en Afrique."]],
            ['fa-solid fa-rocket',
                ['en' => 'Aspiring Influencers', 'am' => 'ተስፈኛ ኢንፍሉዌንሰሮች', 'fr' => 'Influenceurs en devenir'],
                ['en' => 'Newcomers eager to learn from the best and kickstart their journey in the digital space.',
                    'am' => 'ከምርጦቹ ለመማርና በዲጂታሉ ዓለም ጉዟቸውን ለመጀመር የሚጓጉ አዲስ መጪዎች።',
                    'fr' => 'Nouveaux venus désireux d\'apprendre des meilleurs et de lancer leur parcours dans le numérique.']],
        ];

        foreach ($personas as $i => [$icon, $title, $description]) {
            AttendPersona::updateOrCreate(
                ['icon' => $icon],
                ['title' => $title, 'description' => $description, 'sort_order' => $i],
            );
        }
    }

    private function seedTicketing(): void
    {
        $tiers = [
            ['friday-free', 0, 0,
                ['en' => 'Friday Free Pass', 'am' => 'የአርብ ነጻ ፓስ', 'fr' => 'Pass gratuit du vendredi'],
                ['en' => 'General Access', 'am' => 'አጠቃላይ መግቢያ', 'fr' => 'Accès général'],
                ['en' => ['Official opening day access', 'Keynote speakers & main stage', 'Networking opportunities'],
                    'am' => ['የይፋዊ መክፈቻ ቀን መግቢያ', 'ቁልፍ ተናጋሪዎችና ዋና መድረክ', 'የመተዋወቅ እድሎች'],
                    'fr' => ["Accès au jour d'ouverture officiel", 'Conférenciers principaux et scène principale', 'Opportunités de réseautage']],
                ['en' => 'Great for first-timers.', 'am' => 'ለመጀመሪያ ጊዜ ተሳታፊዎች ምርጥ።', 'fr' => 'Idéal pour une première fois.']],
            ['creator', 19900, 1,
                ['en' => 'Creator Pass', 'am' => 'የፈጣሪ ፓስ', 'fr' => 'Pass Créateur'],
                ['en' => 'Saturday + Sunday', 'am' => 'ቅዳሜ + እሁድ', 'fr' => 'Samedi + dimanche'],
                ['en' => ['Full access to premium sessions', 'Expert panels & workshops', 'Meet top creators & brands'],
                    'am' => ['ሙሉ የፕሪሚየም ክፍለ ጊዜዎች መግቢያ', 'የባለሙያ ውይይቶችና ወርክሾፖች', 'ከምርጥ ፈጣሪዎችና ብራንዶች ጋር መገናኘት'],
                    'fr' => ['Accès complet aux sessions premium', "Panels d'experts et ateliers", 'Rencontre des meilleurs créateurs et marques']],
                ['en' => 'Perfect for leveling up.', 'am' => 'ደረጃ ለማሳደግ ፍጹም።', 'fr' => 'Parfait pour passer au niveau supérieur.']],
            ['vip', 49900, 2,
                ['en' => 'All-Access VIP', 'am' => 'ሁሉን አቀፍ VIP', 'fr' => 'VIP tout accès'],
                ['en' => 'Full Weekend', 'am' => 'ሙሉ ቅዳሜና እሁድ', 'fr' => 'Week-end complet'],
                ['en' => ['Everything in Creator Pass', 'VIP lounge & front-row seats', 'Private networking events'],
                    'am' => ['በፈጣሪ ፓስ ያለው ሁሉ', 'የVIP ማረፊያና የፊት ረድፍ መቀመጫዎች', 'የግል የመተዋወቂያ ዝግጅቶች'],
                    'fr' => ['Tout le contenu du Pass Créateur', 'Salon VIP et places au premier rang', 'Événements de réseautage privés']],
                ['en' => 'The ultimate experience.', 'am' => 'የመጨረሻው ተሞክሮ።', 'fr' => "L'expérience ultime."]],
        ];

        foreach ($tiers as [$slug, $price, $sort, $name, $subtitle, $perks, $badge]) {
            TicketTier::updateOrCreate(['slug' => $slug], [
                'name' => $name,
                'subtitle' => $subtitle,
                'price_minor' => $price,
                'currency' => 'USD',
                'perks' => $perks,
                'badge' => $badge,
                'is_active' => true,
                'sort_order' => $sort,
            ]);
        }

        $addons = [
            ['airport-transfer', 4000,
                ['en' => 'Airport Transfer', 'am' => 'የአየር ማረፊያ ትራንስፈር', 'fr' => 'Transfert aéroport']],
            ['addis-tour', 7500,
                ['en' => 'Addis Ababa Tour', 'am' => 'የአዲስ አበባ ጉብኝት', 'fr' => "Visite d'Addis-Abeba"]],
            ['advanced-workshop', 12000,
                ['en' => 'Advanced Workshop', 'am' => 'የላቀ ወርክሾፕ', 'fr' => 'Atelier avancé']],
            ['gala-after-party', 9000,
                ['en' => 'Awards Gala After-Party', 'am' => 'የሽልማት ጋላ ድህረ-ፓርቲ', 'fr' => 'After-party du gala des prix']],
        ];

        foreach ($addons as $i => [$slug, $price, $name]) {
            Addon::updateOrCreate(['slug' => $slug], [
                'name' => $name,
                'price_minor' => $price,
                'sort_order' => $i,
            ]);
        }

        $hotels = [
            ['own-stay', "I'll arrange my own stay",
                ['en' => 'No cost', 'am' => 'ክፍያ የለውም', 'fr' => 'Sans frais']],
            ['skylight', 'Skylight Hotel',
                ['en' => 'Official Event Venue', 'am' => 'ይፋዊ የዝግጅቱ ስፍራ', 'fr' => "Lieu officiel de l'événement"]],
            ['hyatt', 'Hyatt Regency',
                ['en' => '5-min walk to venue', 'am' => 'ከስፍራው 5 ደቂቃ በእግር', 'fr' => 'À 5 min à pied du lieu']],
            ['radisson', 'Radisson Blu',
                ['en' => '10-min shuttle ride', 'am' => '10 ደቂቃ በሽያጭ አገልግሎት', 'fr' => 'À 10 min en navette']],
        ];

        foreach ($hotels as $i => [$slug, $name, $note]) {
            Hotel::updateOrCreate(['slug' => $slug], [
                'name' => $name,
                'note' => $note,
                'sort_order' => $i,
            ]);
        }
    }
}
