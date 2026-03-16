/* ==========================================================================
   AK Automobile — Vehicle Data Module
   Used car inventory for modal, cards, and inquiry form
   ========================================================================== */

const vehicleData = [
  // --- Kleinwagen ---
  {
    id: "vw-polo",
    brand: "Volkswagen",
    model: "Polo 1.0 TSI Style",
    name: "VW Polo 1.0 TSI Style",
    year: 2021,
    price: 14900,
    mileage: "48.000 km",
    category: "kleinwagen",
    fuel: "Benzin",
    badge: "Top-Angebot",
    images: [
      "https://images.pexels.com/photos/19292927/pexels-photo-19292927.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/19292927/pexels-photo-19292927.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 95,
      topSpeed: "187 km/h",
      acceleration: "10.8s",
      engine: "1.0L TSI 3-Zylinder",
      drivetrain: "FWD",
      fuel: "Benzin",
      transmission: "6-Gang Schaltung"
    },
    description: {
      en: "Well-maintained VW Polo with full service history. Equipped with LED headlights, adaptive cruise control, and an 8-inch touchscreen with App-Connect. Non-smoker vehicle, single owner.",
      de: "Gepflegter VW Polo mit vollständiger Servicehistorie. Ausgestattet mit LED-Scheinwerfern, adaptivem Tempomat und 8-Zoll-Touchscreen mit App-Connect. Nichtraucher-Fahrzeug, Erstbesitzer."
    }
  },
  {
    id: "opel-corsa",
    brand: "Opel",
    model: "Corsa 1.2 GS Line",
    name: "Opel Corsa 1.2 GS Line",
    year: 2022,
    price: 15900,
    mileage: "32.000 km",
    category: "kleinwagen",
    fuel: "Benzin",
    images: [
      "https://images.pexels.com/photos/18305913/pexels-photo-18305913.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/17260495/pexels-photo-17260495.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 100,
      topSpeed: "188 km/h",
      acceleration: "10.5s",
      engine: "1.2L Turbo 3-Zylinder",
      drivetrain: "FWD",
      fuel: "Benzin",
      transmission: "6-Gang Schaltung"
    },
    description: {
      en: "Sporty Opel Corsa GS Line with Matrix LED headlights, heated seats, and parking sensors. Low mileage, accident-free, and freshly inspected.",
      de: "Sportlicher Opel Corsa GS Line mit Matrix-LED-Scheinwerfern, Sitzheizung und Einparkhilfe. Geringe Laufleistung, unfallfrei und frisch inspiziert."
    }
  },
  {
    id: "ford-fiesta",
    brand: "Ford",
    model: "Fiesta 1.0 EcoBoost ST-Line",
    name: "Ford Fiesta 1.0 EcoBoost ST-Line",
    year: 2020,
    price: 12900,
    mileage: "61.000 km",
    category: "kleinwagen",
    fuel: "Benzin",
    images: [
      "https://images.pexels.com/photos/12310882/pexels-photo-12310882.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/12310882/pexels-photo-12310882.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 125,
      topSpeed: "200 km/h",
      acceleration: "9.4s",
      engine: "1.0L EcoBoost 3-Zylinder",
      drivetrain: "FWD",
      fuel: "Benzin",
      transmission: "6-Gang Schaltung"
    },
    description: {
      en: "Fun-to-drive Ford Fiesta ST-Line with sporty chassis, 17-inch alloys, and B&O sound system. Well-maintained with complete service records.",
      de: "Fahrspaß pur: Ford Fiesta ST-Line mit Sportfahrwerk, 17-Zoll-Alufelgen und B&O Soundsystem. Gepflegt mit vollständigem Scheckheft."
    }
  },

  // --- Kompaktklasse ---
  {
    id: "vw-golf",
    brand: "Volkswagen",
    model: "Golf 1.5 TSI Life",
    name: "VW Golf 1.5 TSI Life",
    year: 2022,
    price: 21900,
    mileage: "38.000 km",
    category: "kompakt",
    fuel: "Benzin",
    badge: "Bestseller",
    images: [
      "https://images.pexels.com/photos/18690927/pexels-photo-18690927.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/10843557/pexels-photo-10843557.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 150,
      topSpeed: "224 km/h",
      acceleration: "8.5s",
      engine: "1.5L TSI evo2",
      drivetrain: "FWD",
      fuel: "Benzin",
      transmission: "7-Gang DSG"
    },
    description: {
      en: "The Golf 8 in Life trim with DSG automatic, digital cockpit, wireless App-Connect, and travel assist. Garage-kept, non-smoker, excellent condition.",
      de: "Golf 8 in Life-Ausstattung mit DSG-Automatik, Digital Cockpit, Wireless App-Connect und Travel Assist. Garagenfahrzeug, Nichtraucher, Top-Zustand."
    }
  },
  {
    id: "ford-focus",
    brand: "Ford",
    model: "Focus 1.5 EcoBoost Titanium",
    name: "Ford Focus 1.5 EcoBoost Titanium",
    year: 2021,
    price: 18900,
    mileage: "52.000 km",
    category: "kompakt",
    fuel: "Benzin",
    images: [
      "https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 150,
      topSpeed: "220 km/h",
      acceleration: "8.8s",
      engine: "1.5L EcoBoost",
      drivetrain: "FWD",
      fuel: "Benzin",
      transmission: "8-Gang Automatik"
    },
    description: {
      en: "Spacious Ford Focus Titanium with excellent driving dynamics, Bang & Olufsen sound, and full LED lighting. Perfect family car with great fuel economy.",
      de: "Geräumiger Ford Focus Titanium mit hervorragender Fahrdynamik, Bang & Olufsen Sound und Voll-LED-Beleuchtung. Perfektes Familienauto mit niedrigem Verbrauch."
    }
  },
  {
    id: "hyundai-i30",
    brand: "Hyundai",
    model: "i30 1.6 CRDi N Line",
    name: "Hyundai i30 1.6 CRDi N Line",
    year: 2021,
    price: 17900,
    mileage: "45.000 km",
    category: "kompakt",
    fuel: "Diesel",
    images: [
      "https://images.pexels.com/photos/12007134/pexels-photo-12007134.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/12007134/pexels-photo-12007134.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 136,
      topSpeed: "205 km/h",
      acceleration: "9.7s",
      engine: "1.6L CRDi Diesel",
      drivetrain: "FWD",
      fuel: "Diesel",
      transmission: "7-Gang DCT"
    },
    description: {
      en: "Sporty Hyundai i30 N Line with diesel efficiency and 5 years manufacturer warranty remaining. Features include heated steering wheel, wireless charging, and premium navigation.",
      de: "Sportlicher Hyundai i30 N Line mit Diesel-Effizienz und 5 Jahren Herstellergarantie. Ausstattung: beheizbares Lenkrad, kabelloses Laden und Premium-Navigation."
    }
  },

  // --- Mittelklasse ---
  {
    id: "bmw-3er",
    brand: "BMW",
    model: "320d xDrive M Sport",
    name: "BMW 320d xDrive M Sport",
    year: 2022,
    price: 34900,
    mileage: "41.000 km",
    category: "mittelklasse",
    fuel: "Diesel",
    badge: "Premium",
    images: [
      "https://images.pexels.com/photos/28775849/pexels-photo-28775849.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/18346527/pexels-photo-18346527.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 190,
      topSpeed: "240 km/h",
      acceleration: "6.9s",
      engine: "2.0L TwinPower Turbo Diesel",
      drivetrain: "AWD (xDrive)",
      fuel: "Diesel",
      transmission: "8-Gang Steptronic"
    },
    description: {
      en: "BMW 320d M Sport with xDrive all-wheel drive, M Sport brakes, adaptive suspension, and head-up display. Full BMW service history, Vernasca leather interior.",
      de: "BMW 320d M Sport mit xDrive Allrad, M Sportbremsen, adaptivem Fahrwerk und Head-Up Display. Volle BMW Servicehistorie, Vernasca Lederausstattung."
    }
  },
  {
    id: "audi-a4",
    brand: "Audi",
    model: "A4 Avant 40 TDI S line",
    name: "Audi A4 Avant 40 TDI S line",
    year: 2021,
    price: 31900,
    mileage: "55.000 km",
    category: "mittelklasse",
    fuel: "Diesel",
    images: [
      "https://images.pexels.com/photos/18518090/pexels-photo-18518090.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/18518090/pexels-photo-18518090.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 204,
      topSpeed: "246 km/h",
      acceleration: "6.8s",
      engine: "2.0L TDI",
      drivetrain: "FWD",
      fuel: "Diesel",
      transmission: "7-Gang S tronic"
    },
    description: {
      en: "Elegant Audi A4 Avant in S line with virtual cockpit plus, MMI navigation, and matrix LED headlights. Spacious estate with premium comfort.",
      de: "Eleganter Audi A4 Avant in S line mit Virtual Cockpit Plus, MMI Navigation und Matrix LED-Scheinwerfern. Geräumiger Kombi mit Premium-Komfort."
    }
  },
  {
    id: "mercedes-c",
    brand: "Mercedes-Benz",
    model: "C 220 d AMG Line",
    name: "Mercedes-Benz C 220 d AMG Line",
    year: 2022,
    price: 36900,
    mileage: "35.000 km",
    category: "mittelklasse",
    fuel: "Diesel",
    images: [
      "https://images.pexels.com/photos/10224502/pexels-photo-10224502.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/4003126/pexels-photo-4003126.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 200,
      topSpeed: "245 km/h",
      acceleration: "7.3s",
      engine: "2.0L OM654 Diesel + Mild-Hybrid",
      drivetrain: "RWD",
      fuel: "Diesel",
      transmission: "9G-TRONIC"
    },
    description: {
      en: "New generation C-Class in AMG Line with MBUX infotainment, 11.9-inch central display, and augmented reality navigation. Rear-axle steering for exceptional agility.",
      de: "Neue Generation C-Klasse in AMG Line mit MBUX Infotainment, 11,9-Zoll Zentraldisplay und Augmented-Reality-Navigation. Hinterachslenkung für außergewöhnliche Agilität."
    }
  },

  // --- Kombi ---
  {
    id: "skoda-octavia",
    brand: "Skoda",
    model: "Octavia Combi 2.0 TDI Style",
    name: "Skoda Octavia Combi 2.0 TDI Style",
    year: 2021,
    price: 22900,
    mileage: "58.000 km",
    category: "kombi",
    fuel: "Diesel",
    images: [
      "https://images.pexels.com/photos/19244016/pexels-photo-19244016.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/19244016/pexels-photo-19244016.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 150,
      topSpeed: "224 km/h",
      acceleration: "8.6s",
      engine: "2.0L TDI EVO",
      drivetrain: "FWD",
      fuel: "Diesel",
      transmission: "7-Gang DSG"
    },
    description: {
      en: "The ultimate family estate. Skoda Octavia Combi with 640 liters of trunk space, canton sound system, and virtual cockpit. Reliable, practical, and efficient.",
      de: "Der ultimative Familienkombi. Skoda Octavia Combi mit 640 Liter Kofferraum, Canton Soundsystem und Virtual Cockpit. Zuverlässig, praktisch und sparsam."
    }
  },
  {
    id: "vw-passat",
    brand: "Volkswagen",
    model: "Passat Variant 2.0 TDI Elegance",
    name: "VW Passat Variant 2.0 TDI Elegance",
    year: 2020,
    price: 24900,
    mileage: "68.000 km",
    category: "kombi",
    fuel: "Diesel",
    badge: "Familien-Tipp",
    images: [
      "https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 150,
      topSpeed: "222 km/h",
      acceleration: "8.7s",
      engine: "2.0L TDI EVO",
      drivetrain: "FWD",
      fuel: "Diesel",
      transmission: "7-Gang DSG"
    },
    description: {
      en: "Spacious VW Passat Variant in Elegance trim with ergoActive seats, area view camera, and DCC adaptive suspension. The perfect long-distance cruiser.",
      de: "Geräumiger VW Passat Variant in Elegance-Ausstattung mit ergoActive-Sitzen, Area-View-Kamera und DCC-Fahrwerk. Der perfekte Langstrecken-Cruiser."
    }
  },

  // --- SUV ---
  {
    id: "hyundai-tucson",
    brand: "Hyundai",
    model: "Tucson 1.6 T-GDi Hybrid Prime",
    name: "Hyundai Tucson 1.6 T-GDi Hybrid",
    year: 2022,
    price: 29900,
    mileage: "34.000 km",
    category: "suv",
    fuel: "Hybrid",
    badge: "Eco-Tipp",
    images: [
      "https://images.pexels.com/photos/1134857/pexels-photo-1134857.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1134857/pexels-photo-1134857.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 230,
      topSpeed: "193 km/h",
      acceleration: "8.0s",
      engine: "1.6L T-GDi + Elektromotor",
      drivetrain: "AWD",
      fuel: "Hybrid",
      transmission: "6-Gang Automatik"
    },
    description: {
      en: "Award-winning Hyundai Tucson Hybrid with striking design, BOSE sound, panoramic roof, and all-wheel drive. Efficient hybrid powertrain with 230 combined HP.",
      de: "Preisgekrönter Hyundai Tucson Hybrid mit markantem Design, BOSE Sound, Panoramadach und Allradantrieb. Effizienter Hybridantrieb mit 230 PS Systemleistung."
    }
  },
  {
    id: "vw-tiguan",
    brand: "Volkswagen",
    model: "Tiguan 2.0 TDI Elegance",
    name: "VW Tiguan 2.0 TDI Elegance",
    year: 2021,
    price: 27900,
    mileage: "47.000 km",
    category: "suv",
    fuel: "Diesel",
    images: [
      "https://images.pexels.com/photos/14038277/pexels-photo-14038277.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/14038277/pexels-photo-14038277.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 150,
      topSpeed: "211 km/h",
      acceleration: "9.2s",
      engine: "2.0L TDI",
      drivetrain: "FWD",
      fuel: "Diesel",
      transmission: "7-Gang DSG"
    },
    description: {
      en: "Popular VW Tiguan in Elegance with IQ.Light LED matrix, harman/kardon sound, and easy open tailgate. The ideal all-rounder for families.",
      de: "Beliebter VW Tiguan in Elegance mit IQ.Light LED Matrix, harman/kardon Sound und Easy-Open Heckklappe. Der ideale Allrounder für Familien."
    }
  },
  {
    id: "mazda-cx5",
    brand: "Mazda",
    model: "CX-5 2.2 SKYACTIV-D Sports-Line",
    name: "Mazda CX-5 2.2 SKYACTIV-D",
    year: 2021,
    price: 26900,
    mileage: "42.000 km",
    category: "suv",
    fuel: "Diesel",
    images: [
      "https://images.pexels.com/photos/2612855/pexels-photo-2612855.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/2612855/pexels-photo-2612855.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    specs: {
      hp: 184,
      topSpeed: "214 km/h",
      acceleration: "8.8s",
      engine: "2.2L SKYACTIV-D Diesel",
      drivetrain: "AWD",
      fuel: "Diesel",
      transmission: "6-Gang Automatik"
    },
    description: {
      en: "Premium Mazda CX-5 Sports-Line with all-wheel drive, Nappa leather, BOSE sound, and head-up display. Japanese quality meets European comfort.",
      de: "Premium Mazda CX-5 Sports-Line mit Allrad, Nappa-Leder, BOSE Sound und Head-Up Display. Japanische Qualität trifft europäischen Komfort."
    }
  }
];

function getVehicleById(id) {
  return vehicleData.find(v => v.id === id) || null;
}

function formatPrice(price) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(price);
}
