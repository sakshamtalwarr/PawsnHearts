import { Animal, LedgerEntry, Stats, SiteSettings } from "../types";

export const INITIAL_ANIMALS: Animal[] = [
  {
    "id": "5e0d84ab-1628-4986-add9-bf6074fc060f",
    "name": "Dug-Dug",
    "slug": "dug-dug",
    "category": "adoption",
    "status": "adopted",
    "tags": [
      "Indie"
    ],
    "short_desc": "Meet Dug-Dug ",
    "full_story": "I found him on my way home from the office. I saw him on the road and gave him some doggy biscuits. Instead of eating them, he started playing with them 😂. After some time, I found out where he lived and went to his home, but his owner refused to take him back. They had left him on the road because he barks a lot.\n\nA few days later, I remembered seeing some puppies near my home, so I thought maybe he had come from there. I went there and searched but couldn’t find any of them.\n\nI was going to leave him on the road with some other friendly dogs that I know, but nearby, a security guard came and said, “He’s a boy, I’ll keep him.” After verifying everything and making sure he was actually going to take care of him, we bought him a belt for the security guard to keep him safely.\n\nAnd finally, he took him home. ❤️",
    "medical_details": "He's Vaccinated",
    "funds_needed": "0.00",
    "funds_raised": "0.00",
    "hero_image": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794323050/pawsnhearts/animals/pt4cmfkykc39n8nlpj8x.jpg",
    "is_featured": false,
    "sort_order": 0,
    "created_at": "2026-11-10T12:44:54.408Z",
    "updated_at": "2026-11-10T12:46:45.942Z",
    "media": [
      {
        "id": "693c194c-a51b-485f-b76a-1b7f0a7a751f",
        "animal_id": "5e0d84ab-1628-4986-add9-bf6074fc060f",
        "media_type": "photo",
        "url": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794323050/pawsnhearts/animals/pt4cmfkykc39n8nlpj8x.jpg",
        "caption": "Dug-Dug profile photo",
        "sort_order": 0,
        "created_at": "2026-11-10T15:07:54.070751+00:00"
      },
      {
        "id": "2829a829-d129-4a18-8d2d-c31c6b4ddd8a",
        "animal_id": "5e0d84ab-1628-4986-add9-bf6074fc060f",
        "media_type": "photo",
        "url": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794323102/pawsnhearts/animals/cf3tfngfhz7eehb4eitq.jpg",
        "caption": "Dug-Dug rescue photo 1",
        "sort_order": 1,
        "created_at": "2026-11-10T15:07:54.070751+00:00"
      },
      {
        "id": "450d5cfa-372b-4d60-b655-d6ad55638266",
        "animal_id": "5e0d84ab-1628-4986-add9-bf6074fc060f",
        "media_type": "photo",
        "url": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794323103/pawsnhearts/animals/a2zy5kvrsrati6ad9yfh.jpg",
        "caption": "Dug-Dug rescue photo 2",
        "sort_order": 2,
        "created_at": "2026-11-10T15:07:54.070751+00:00"
      }
    ]
  },
  {
    "id": "455ee0db-5529-455b-a044-ad436745767b",
    "name": "TinTin",
    "slug": "tintin",
    "category": "treatment",
    "status": "urgent",
    "tags": [
      "Stray",
      "Accident Emergency",
      "Hip Fracture",
      "Surgery",
      "Kumarapark",
      "Bengaluru",
      "Indie Dog"
    ],
    "short_desc": "Tin Tin is a rescued indie dog who was tragically hit by a car in Kumarapark. She suffered a broken hip socket and urgently needs emergency surgery tomorrow to be able to walk again.",
    "full_story": "Tin Tin was adopted as a stray puppy by my cousin and grew into a deeply loved companion. Yesterday, during her regular walk in the Kumarapark neighborhood, a car came out of nowhere and hit her. We rushed her to the vet, where X-rays confirmed the heartbreaking news: her hip socket is severely broken and fractured. She is currently in a lot of pain and her surgery is scheduled for tomorrow. We are urgently trying to pool together the funds needed to cover her operation and the subsequent rehabilitation so she can get back on her feet and have a second chance at a happy life.",
    "medical_details": "X-rays confirm a broken and fractured hip socket. Emergency orthopedic surgery is scheduled for tomorrow to repair the damage. Post-operative care requires a mandatory 1-month strict bedrest period for proper healing and rehabilitation.",
    "funds_needed": "10286.00",
    "funds_raised": "0.00",
    "hero_image": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794288260/pawsnhearts/animals/izkivbzbeocebllsifej.jpg",
    "is_featured": false,
    "sort_order": 0,
    "created_at": "2026-11-10T05:25:16.993Z",
    "updated_at": "2026-11-10T14:40:42.750Z",
    "media": [
      {
        "id": "a2e0b9ff-bec9-48b5-ab5c-53d3c9c872e8",
        "animal_id": "455ee0db-5529-455b-a044-ad436745767b",
        "media_type": "photo",
        "url": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794299716/pawsnhearts/animals/xgr8qrprqwr6edary9iv.jpg",
        "caption": "WhatsApp Image 2026 11 09 at 20.28.14",
        "sort_order": 0,
        "created_at": "2026-11-10T14:40:42.777815+00:00"
      },
      {
        "id": "1906e44b-f001-4ab2-bb96-cba1d947f897",
        "animal_id": "455ee0db-5529-455b-a044-ad436745767b",
        "media_type": "photo",
        "url": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794299717/pawsnhearts/animals/r0yy3hsc2qumyys8etkn.jpg",
        "caption": "WhatsApp Image 2026 11 09 at 20.35.09",
        "sort_order": 1,
        "created_at": "2026-11-10T14:40:42.791695+00:00"
      },
      {
        "id": "e4420a86-7ac6-461f-a1c7-7778ad127bf5",
        "animal_id": "455ee0db-5529-455b-a044-ad436745767b",
        "media_type": "photo",
        "url": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794299716/pawsnhearts/animals/pf9gyaqeaad26hsvwjql.jpg",
        "caption": "WhatsApp Image 2026 11 10 at 10.48.33",
        "sort_order": 2,
        "created_at": "2026-11-10T14:40:42.805292+00:00"
      },
      {
        "id": "37b62bbd-5712-4571-85c0-8bf6f6ab8c54",
        "animal_id": "455ee0db-5529-455b-a044-ad436745767b",
        "media_type": "photo",
        "url": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794299717/pawsnhearts/animals/nc1obj2olddscbe3vqvi.jpg",
        "caption": "WhatsApp Image 2026 11 10 at 10.48.34",
        "sort_order": 3,
        "created_at": "2026-11-10T14:40:42.819017+00:00"
      },
      {
        "id": "1fe6e94a-b5ea-458f-bc8a-7bbcfb2e6a0e",
        "animal_id": "455ee0db-5529-455b-a044-ad436745767b",
        "media_type": "video",
        "url": "https://res.cloudinary.com/dp2kretaw/video/upload/v1794299716/pawsnhearts/animals/dux3oax3aqss1feuh9if.mp4",
        "caption": "WhatsApp Video 2026 11 09 at 20.28.14",
        "sort_order": 4,
        "created_at": "2026-11-10T14:40:42.833279+00:00"
      },
      {
        "id": "381e4b26-c93c-40ba-9751-bc9bfc3d4a06",
        "animal_id": "455ee0db-5529-455b-a044-ad436745767b",
        "media_type": "photo",
        "url": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794335720/pawsnhearts/animals/webrykg7t1z0uhwl6dui.jpg",
        "caption": "WhatsApp Image 2026 11 10 at 19.48.13",
        "sort_order": 5,
        "created_at": "2026-11-10T14:40:42.846796+00:00"
      },
      {
        "id": "d8e5d9bb-840b-460f-8b44-d43326965da4",
        "animal_id": "455ee0db-5529-455b-a044-ad436745767b",
        "media_type": "photo",
        "url": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794335723/pawsnhearts/animals/s25iohmca1cg9zy32p7p.jpg",
        "caption": "WhatsApp Image 2026 11 10 at 19.48.14",
        "sort_order": 6,
        "created_at": "2026-11-10T14:40:42.860512+00:00"
      },
      {
        "id": "bb5a870d-40e1-4d1b-aa2b-0a64b7563498",
        "animal_id": "455ee0db-5529-455b-a044-ad436745767b",
        "media_type": "photo",
        "url": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794335724/pawsnhearts/animals/ps3pf8iok8yj8q6bzzu3.jpg",
        "caption": "WhatsApp Image 2026 11 10 at 19.48.16 (1)",
        "sort_order": 7,
        "created_at": "2026-11-10T14:40:42.874167+00:00"
      },
      {
        "id": "251c917f-9f2e-49c8-8c9e-87ae0238bfa1",
        "animal_id": "455ee0db-5529-455b-a044-ad436745767b",
        "media_type": "photo",
        "url": "https://res.cloudinary.com/dp2kretaw/image/upload/v1794335726/pawsnhearts/animals/slzofylwbvgxjaivw2du.jpg",
        "caption": "WhatsApp Image 2026 11 10 at 19.48.16",
        "sort_order": 8,
        "created_at": "2026-11-10T14:40:42.887715+00:00"
      },
      {
        "id": "ef40ff88-912d-419a-8ce1-73bebb931625",
        "animal_id": "455ee0db-5529-455b-a044-ad436745767b",
        "media_type": "video",
        "url": "https://res.cloudinary.com/dp2kretaw/video/upload/v1794335731/pawsnhearts/animals/jwyvhbtdslrahsuhrusp.mp4",
        "caption": "WhatsApp Video 2026 11 10 at 19.48.16",
        "sort_order": 9,
        "created_at": "2026-11-10T14:40:42.901713+00:00"
      },
      {
        "id": "706e7ef5-b666-4b90-bc3b-d238b2c13649",
        "animal_id": "455ee0db-5529-455b-a044-ad436745767b",
        "media_type": "video",
        "url": "https://res.cloudinary.com/dp2kretaw/video/upload/v1794335734/pawsnhearts/animals/sbvcmptprpflb5gykbzj.mp4",
        "caption": "WhatsApp Video 2026 11 10 at 19.48.18",
        "sort_order": 10,
        "created_at": "2026-11-10T14:40:42.915752+00:00"
      },
      {
        "id": "054a6cc2-35a7-4764-877c-bedd138e4fbe",
        "animal_id": "455ee0db-5529-455b-a044-ad436745767b",
        "media_type": "video",
        "url": "https://res.cloudinary.com/dp2kretaw/video/upload/v1794335728/pawsnhearts/animals/flc89oij2rlnazjd7yye.mp4",
        "caption": "WhatsApp Video 2026 11 10 at 19.48.15",
        "sort_order": 11,
        "created_at": "2026-11-10T14:40:42.929383+00:00"
      }
    ]
  },
  {
    "id": "1dbc8d1a-e00d-4210-9b88-c1aef11bc535",
    "name": "Chikoo",
    "slug": "chikoo",
    "category": "adoption",
    "status": "adopted",
    "tags": [
      "Adopted ❤️",
      "9 Months Old",
      "Indie Puppy"
    ],
    "short_desc": "Energetic Indie pup found near a highway, now happily adopted!",
    "full_story": "Chikoo was found roaming near a highway junction, scared and hungry. After a gentle bath, deworming, and core vaccinations, he transformed into a radiant bundle of joy and found his forever home!",
    "medical_details": "Fully vaccinated (DHPPi + Anti-Rabies), dewormed, neutered.",
    "funds_needed": "4500.00",
    "funds_raised": "4500.00",
    "hero_image": "https://drive.google.com/thumbnail?id=1lCBFE5X6p11dOYpdbE3e8K6QhOrl786F&sz=w800",
    "is_featured": true,
    "sort_order": 1,
    "created_at": "2026-11-10T04:51:33.173Z",
    "updated_at": "2026-11-10T04:51:33.173Z",
    "media": [
      {
        "id": "9a30ce70-9601-4545-a735-c86d1216dcba",
        "animal_id": "1dbc8d1a-e00d-4210-9b88-c1aef11bc535",
        "media_type": "image",
        "url": "https://drive.google.com/thumbnail?id=1lCBFE5X6p11dOYpdbE3e8K6QhOrl786F&sz=w800",
        "caption": "Rescue Photo",
        "sort_order": 0,
        "created_at": "2026-11-10T04:51:33.399601+00:00"
      }
    ]
  },
  {
    "id": "24f8df21-adb1-487d-aa03-1cac144dc22c",
    "name": "Milo & Lilly",
    "slug": "milo-and-lilly",
    "category": "adoption",
    "status": "adopted",
    "tags": [
      "Adopted ❤️",
      "Kumhara Park Rescue",
      "Sewer Survivor Pups"
    ],
    "short_desc": "Saved from a narrow sewer drain during heavy rain with mama dog, now happily adopted!",
    "full_story": "Rescued after an 8-9 hour operation in the pouring rain out of a sewer line in Kumhara park. Both Milo & Lilly completed their vaccinations and have now been happily adopted into caring forever homes!",
    "medical_details": "Core puppy vaccines, flea & tick treatment, deworming completed.",
    "funds_needed": "1500.00",
    "funds_raised": "1500.00",
    "hero_image": "https://drive.google.com/thumbnail?id=1dmMlc17FDfpIyGcyBYTUHliZZX0A_8rF&sz=w800",
    "is_featured": true,
    "sort_order": 2,
    "created_at": "2026-11-10T04:51:33.621Z",
    "updated_at": "2026-11-10T04:51:33.621Z",
    "media": [
      {
        "id": "99baa9fd-81e3-4ce1-9a47-b11fad340018",
        "animal_id": "24f8df21-adb1-487d-aa03-1cac144dc22c",
        "media_type": "image",
        "url": "https://drive.google.com/thumbnail?id=1dmMlc17FDfpIyGcyBYTUHliZZX0A_8rF&sz=w800",
        "caption": "Rescue Photo",
        "sort_order": 0,
        "created_at": "2026-11-10T04:51:33.84269+00:00"
      }
    ]
  },
  {
    "id": "88dc877a-f49e-4971-b257-5d409462141a",
    "name": "Snoopy",
    "slug": "snoopy",
    "category": "treatment",
    "status": "recovered",
    "tags": [
      "Treated & Recovered ❤️",
      "Broken Leg Healed",
      "Hit & Run Survivor"
    ],
    "short_desc": "One month old puppy hit by a vehicle with broken legs, now 100% healed and running!",
    "full_story": "Snoopy was barely 1 month old when struck by a reckless vehicle, leaving both legs fractured and in extreme agony. Rushed to emergency veterinary care, orthopedic splints and daily antibiotic dressings were applied. Today Snoopy has made a miraculous recovery, walking and playing with boundless energy!",
    "medical_details": "Consultation with orthopaedic vet, leg splinting, calcium bone therapy, anti-inflammatory and pain medications. Treatment receipt available.",
    "funds_needed": "5000.00",
    "funds_raised": "5000.00",
    "hero_image": "https://drive.google.com/thumbnail?id=1XDOCMNwiHkbKWq-FT-E2vZKJFpXEAtAE&sz=w800",
    "is_featured": true,
    "sort_order": 3,
    "created_at": "2026-11-10T04:51:34.064Z",
    "updated_at": "2026-11-10T04:51:34.064Z",
    "media": [
      {
        "id": "7fa56535-c8bc-46b7-b761-ed2399f2505c",
        "animal_id": "88dc877a-f49e-4971-b257-5d409462141a",
        "media_type": "image",
        "url": "https://drive.google.com/thumbnail?id=1XDOCMNwiHkbKWq-FT-E2vZKJFpXEAtAE&sz=w800",
        "caption": "Rescue Photo",
        "sort_order": 0,
        "created_at": "2026-11-10T04:51:34.285146+00:00"
      }
    ]
  },
  {
    "id": "6caf893b-7252-4859-b031-bab53ec5d99f",
    "name": "Snowy",
    "slug": "snowy",
    "category": "treatment",
    "status": "recovered",
    "tags": [
      "Treated & Recovered ❤️",
      "Wound Healed",
      "Puppy Survivor"
    ],
    "short_desc": "One month old puppy rescued from roadside vehicle impact with bruises, fully rehabilitated!",
    "full_story": "Snowy suffered deep bruises and bleeding soft-tissue wounds from a roadside accident. With daily wound cleaning, antibiotic ointments, and nutritional supplements, Snowy made a swift and complete recovery.",
    "medical_details": "Antiseptic dressings, wound suturing, antibiotic course, core puppy booster.",
    "funds_needed": "2000.00",
    "funds_raised": "2000.00",
    "hero_image": "https://drive.google.com/thumbnail?id=18oZkTq3A2ybHf8N9xURpMeFO7j1WKO4Z&sz=w800",
    "is_featured": false,
    "sort_order": 4,
    "created_at": "2026-11-10T04:51:34.511Z",
    "updated_at": "2026-11-10T04:51:34.511Z",
    "media": [
      {
        "id": "38b39b43-6664-471a-81aa-b8528990f69c",
        "animal_id": "6caf893b-7252-4859-b031-bab53ec5d99f",
        "media_type": "image",
        "url": "https://drive.google.com/thumbnail?id=18oZkTq3A2ybHf8N9xURpMeFO7j1WKO4Z&sz=w800",
        "caption": "Rescue Photo",
        "sort_order": 0,
        "created_at": "2026-11-10T04:51:34.731018+00:00"
      }
    ]
  },
  {
    "id": "b2b305b5-c072-413d-944c-a89255c8f564",
    "name": "Brownie",
    "slug": "brownie",
    "category": "treatment",
    "status": "recovered",
    "tags": [
      "Treated & Recovered ❤️",
      "Drip & Bandages",
      "Fully Healed"
    ],
    "short_desc": "Underwent daily intravenous drips and bandage changes, fully healed and energetic!",
    "full_story": "Brownie was rescued severely dehydrated with infected abrasions. Placed on daily IV fluid therapy and sterile bandages, Brownie regained vitality and is now in peak physical health!",
    "medical_details": "Daily saline drip, electrolyte rehydration, sterile bandage changes and multi-vitamins.",
    "funds_needed": "2000.00",
    "funds_raised": "2000.00",
    "hero_image": "https://drive.google.com/thumbnail?id=1xv9svVcgzwi9NDpRNJrMyrSaIi7-SG_h&sz=w800",
    "is_featured": false,
    "sort_order": 5,
    "created_at": "2026-11-10T04:51:34.951Z",
    "updated_at": "2026-11-10T04:51:34.951Z",
    "media": [
      {
        "id": "75102114-b619-44f9-8c94-aa62bc6a9e22",
        "animal_id": "b2b305b5-c072-413d-944c-a89255c8f564",
        "media_type": "image",
        "url": "https://drive.google.com/thumbnail?id=1xv9svVcgzwi9NDpRNJrMyrSaIi7-SG_h&sz=w800",
        "caption": "Rescue Photo",
        "sort_order": 0,
        "created_at": "2026-11-10T04:51:35.171001+00:00"
      }
    ]
  }
];

export const INITIAL_LEDGER: LedgerEntry[] = [
  {
    "id": "9d4521a1-f12e-4fea-a0ae-d07ca7de7650",
    "animal_id": null,
    "donor_name": "Ansh",
    "amount": "2000.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-23T18:30:00.000Z",
    "notes": "Sponsorship for puppy medical care",
    "created_at": "2026-11-10T04:51:35.391Z"
  },
  {
    "id": "7de73c87-a7f5-432c-b711-7f8157a29602",
    "animal_id": null,
    "donor_name": "Simran",
    "amount": "550.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-23T18:30:00.000Z",
    "notes": "Support for Snoopy recovery",
    "created_at": "2026-11-10T04:51:35.611Z"
  },
  {
    "id": "089d4af8-dacc-41a2-b943-a95f936f42b8",
    "animal_id": null,
    "donor_name": "Lalit",
    "amount": "251.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-22T18:30:00.000Z",
    "notes": "Support for rescues",
    "created_at": "2026-11-10T04:51:38.389Z"
  },
  {
    "id": "583331f0-efca-4940-bc3f-4f109c8f1a41",
    "animal_id": null,
    "donor_name": "Mansi",
    "amount": "500.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-22T18:30:00.000Z",
    "notes": "Vet care",
    "created_at": "2026-11-10T04:51:36.984Z"
  },
  {
    "id": "5376bfb2-26d8-44ea-b362-ad56e5216762",
    "animal_id": null,
    "donor_name": "Yash jindal",
    "amount": "200.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-22T18:30:00.000Z",
    "notes": "Medical support",
    "created_at": "2026-11-10T04:51:39.052Z"
  },
  {
    "id": "77742e4d-17e2-4e52-9f77-a4112120444c",
    "animal_id": null,
    "donor_name": "Happy",
    "amount": "200.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-22T18:30:00.000Z",
    "notes": "Food treats",
    "created_at": "2026-11-10T04:51:38.832Z"
  },
  {
    "id": "b14903df-fe27-406e-a324-068a787c1953",
    "animal_id": null,
    "donor_name": "Arpit",
    "amount": "500.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-22T18:30:00.000Z",
    "notes": "Rescue rehabilitation",
    "created_at": "2026-11-10T04:51:37.291Z"
  },
  {
    "id": "81a1fcfc-c5af-4180-b52e-a1a52a0effb0",
    "animal_id": null,
    "donor_name": "Deepika",
    "amount": "500.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-21T18:30:00.000Z",
    "notes": "Puppy vaccines",
    "created_at": "2026-11-10T04:51:36.718Z"
  },
  {
    "id": "c1765d54-ca36-419e-9958-d6547795fc2f",
    "animal_id": null,
    "donor_name": "Bhumi Ghabrani",
    "amount": "500.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-21T18:30:00.000Z",
    "notes": "Medical support",
    "created_at": "2026-11-10T04:51:36.498Z"
  },
  {
    "id": "8e01c5d7-6416-4d78-b673-0d92a7a2a38c",
    "animal_id": null,
    "donor_name": "Akansha",
    "amount": "2000.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-20T18:30:00.000Z",
    "notes": "Emergency vet bills fund",
    "created_at": "2026-11-10T04:51:35.830Z"
  },
  {
    "id": "d51d824b-84e1-41de-8e77-bd86022a5093",
    "animal_id": null,
    "donor_name": "Vidish",
    "amount": "1000.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-20T18:30:00.000Z",
    "notes": "Food and puppy nourishment",
    "created_at": "2026-11-10T04:51:36.051Z"
  },
  {
    "id": "48003ab4-e7d1-4368-8606-c2326c37731d",
    "animal_id": null,
    "donor_name": "Jhalak",
    "amount": "300.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-20T18:30:00.000Z",
    "notes": "Care sponsorship",
    "created_at": "2026-11-10T04:51:38.170Z"
  },
  {
    "id": "e685d059-c665-4952-bf62-9d210df1bcfd",
    "animal_id": null,
    "donor_name": "Soham",
    "amount": "200.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-19T18:30:00.000Z",
    "notes": "Rescue relief",
    "created_at": "2026-11-10T04:51:39.286Z"
  },
  {
    "id": "e41f5245-037f-497e-928d-f1769f2f395c",
    "animal_id": null,
    "donor_name": "Saksham",
    "amount": "500.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-19T18:30:00.000Z",
    "notes": "Initial rescue launch donation",
    "created_at": "2026-11-10T04:51:36.278Z"
  },
  {
    "id": "c017384f-abff-4fa2-b993-2fd508a2fb3b",
    "animal_id": null,
    "donor_name": "Manya Arora",
    "amount": "500.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-19T18:30:00.000Z",
    "notes": "Care fund",
    "created_at": "2026-11-10T04:51:37.510Z"
  },
  {
    "id": "94699613-6207-4662-9649-e2679d213aa5",
    "animal_id": null,
    "donor_name": "Vibhav Bhardwaj",
    "amount": "500.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-19T18:30:00.000Z",
    "notes": "Vet medical expenses",
    "created_at": "2026-11-10T04:51:37.730Z"
  },
  {
    "id": "be8d1ded-5fbc-45bb-85af-5245683c08e5",
    "animal_id": null,
    "donor_name": "Sunny",
    "amount": "300.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-19T18:30:00.000Z",
    "notes": "Puppy medicine",
    "created_at": "2026-11-10T04:51:37.950Z"
  },
  {
    "id": "099f45cb-957c-4786-bc1f-7716f834d44f",
    "animal_id": null,
    "donor_name": "Senpai7",
    "amount": "250.00",
    "entry_type": "donation",
    "payment_method": "UPI",
    "reference_id": null,
    "receipt_url": null,
    "is_verified": true,
    "transaction_date": "2026-02-19T18:30:00.000Z",
    "notes": "Vaccine fund",
    "created_at": "2026-11-10T04:51:38.611Z"
  }
];

export const INITIAL_STATS: Stats = {
  page_views: 1340,
  total_raised: 10751,
  total_expenses: 9850,
  active_treatments: 1,
  animals_adopted: 2,
  animals_recovered: 3,
  total_rescued: 6,
};

export const INITIAL_SETTINGS: SiteSettings = {
  upi_id: "salesabshappypaws@oksbi",
  payee_name: "PawsAndHearts",
  contact_phone: "+91 7217739614",
  contact_location: "BLR, India",
  emergency_banner: "🚨 Emergency Hip Surgery Fund for TinTin Active Now!",
  enable_donations: true,
};
