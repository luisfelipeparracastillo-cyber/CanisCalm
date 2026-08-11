/**
 * Catálogo Oficial FCI de 100 Razas Caninas con perfiles de reactividad canina
 * Basado en los estándares oficiales de la Fédération Cynologique Internationale (FCI).
 */
export const HUNDRED_FCI_BREEDS = [
  // --- GRUPO 1: PERROS DE PASTOR Y BOYEROS ---
  {
    id: 1,
    name: "Pastor Alemán",
    fci_group: "Grupo 1: Perros de Pastor",
    fci_standard: "FCI N° 166",
    fci_origin: "Alemania",
    description: "Perro de trabajo versátil, inteligente y alerta. Requiere alta estimulación mental y ejercicio diario. Propenso a reactividad por frustración en correa y guardia visual.",
    energy_level: 4, prey_drive: 4, sensitivity: 4, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    name: "Pastor Belga Malinois",
    fci_group: "Grupo 1: Perros de Pastor",
    fci_standard: "FCI N° 15",
    fci_origin: "Bélgica",
    description: "Raza de trabajo e impulso extremo. Sensibilidad altísima al movimiento rápido y respuesta reactiva explosiva si no se canaliza su impulso de trabajo.",
    energy_level: 5, prey_drive: 5, sensitivity: 4, arousal_threshold: 5,
    image_url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    name: "Border Collie",
    fci_group: "Grupo 1: Perros de Pastor",
    fci_standard: "FCI N° 297",
    fci_origin: "Gran Bretaña",
    description: "La raza más inteligente del mundo según pruebas de trabajo. Hipersensible al movimiento visual (bicicletas, autos, niños corriendo). Su reactividad se manifiesta como fijación de mirada y asecho.",
    energy_level: 5, prey_drive: 4, sensitivity: 5, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    name: "Pastor Australiano",
    fci_group: "Grupo 1: Perros de Pastor",
    fci_standard: "FCI N° 342",
    fci_origin: "Estados Unidos",
    description: "Perro pastor enérgico y reservado con extraños. Muy leal a la familia; susceptible a reactividad territorial o sobreprotección de recursos.",
    energy_level: 4, prey_drive: 4, sensitivity: 4, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    name: "Pastor Blanco Suizo",
    fci_group: "Grupo 1: Perros de Pastor",
    fci_standard: "FCI N° 347",
    fci_origin: "Suiza",
    description: "Perro elegante, atento y de temperamento más suave que el Pastor Alemán. Muy sensible a regaños o ambientes ruidosos.",
    energy_level: 4, prey_drive: 3, sensitivity: 5, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    name: "Corgi Galés Pembroke",
    fci_group: "Grupo 1: Perros de Pastor",
    fci_standard: "FCI N° 39",
    fci_origin: "Gran Bretaña",
    description: "Pequeño pastor audaz y tenacity. Tiende a vocalizar y morder talones por instinto de pastoreo de ganado.",
    energy_level: 4, prey_drive: 3, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1612536057832-2ff7ead7f326?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    name: "Corgi Galés Cardigan",
    fci_group: "Grupo 1: Perros de Pastor",
    fci_standard: "FCI N° 38",
    fci_origin: "Gran Bretaña",
    description: "Pastorcito antiguo de cola larga, más reservado que el Pembroke pero muy leal y guardián del hogar.",
    energy_level: 3, prey_drive: 3, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8,
    name: "Pastor de Shetland (Sheltie)",
    fci_group: "Grupo 1: Perros de Pastor",
    fci_standard: "FCI N° 88",
    fci_origin: "Gran Bretaña",
    description: "Miniatura de pastoreo muy afectuosa y ágil. Alta sensibilidad auditiva y tendencia a la reactividad vocal (ladridos agudos ante timbres o ruidos).",
    energy_level: 4, prey_drive: 3, sensitivity: 5, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 9,
    name: "Boyero de Flandes",
    fci_group: "Grupo 1: Perros de Pastor",
    fci_standard: "FCI N° 191",
    fci_origin: "Bélgica",
    description: "Perro potente, calmo en casa pero sumamente protector. Requiere socialización temprana con otros perros masculinos.",
    energy_level: 3, prey_drive: 4, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 10,
    name: "Collie de Pelo Largo (Rough Collie)",
    fci_group: "Grupo 1: Perros de Pastor",
    fci_standard: "FCI N° 156",
    fci_origin: "Gran Bretaña",
    description: "Famoso perro de temperamento dulce y sensible. Requiere métodos de entrenamiento 100% amables y positivos sin castigos.",
    energy_level: 3, prey_drive: 2, sensitivity: 5, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 11,
    name: "Pastor Holandés",
    fci_group: "Grupo 1: Perros de Pastor",
    fci_standard: "FCI N° 223",
    fci_origin: "Países Bajos",
    description: "Raza atigrada de trabajo atletica y leal. Respuestas veloces y reactivas ante estimulación extrema de movimiento.",
    energy_level: 5, prey_drive: 5, sensitivity: 4, arousal_threshold: 5,
    image_url: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 12,
    name: "Pastor Catalán",
    fci_group: "Grupo 1: Perros de Pastor",
    fci_standard: "FCI N° 87",
    fci_origin: "España",
    description: "Perro de pastoreo autóctono pirenaico de pelaje abundante. Muy sobrio, noble y alerta ante extraños.",
    energy_level: 4, prey_drive: 3, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },

  // --- GRUPO 2: PINSCHER, SCHNAUZER, MOLOSOIDES Y BOYEROS SUIZOS ---
  {
    id: 13,
    name: "Rottweiler",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 147",
    fci_origin: "Alemania",
    description: "Perro de guardia seguro, leal y sereno. Requiere desensibilización temprana para evitar reactividad por territorialidad o desconfianza.",
    energy_level: 4, prey_drive: 4, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 14,
    name: "Dóberman Pinscher",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 143",
    fci_origin: "Alemania",
    description: "Perro elegante, atlético y de reacción instantánea. Receptivo al estrés del guía; propenso a reactividad defensiva en correa.",
    energy_level: 4, prey_drive: 4, sensitivity: 4, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 15,
    name: "Boxer / Boxeador",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 144",
    fci_origin: "Alemania",
    description: "Perro alegre, juguetón y de energía inagotable. Su reactividad suele provenir de sobre-excitación frustrada por saludar a otros perros.",
    energy_level: 5, prey_drive: 3, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 16,
    name: "Gran Danés (Alano Alemán)",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 235",
    fci_origin: "Alemania",
    description: "El gigante afable del mundo canino. De temperamento sereno pero por su gran tamaño requiere excelente manejo de correa.",
    energy_level: 3, prey_drive: 2, sensitivity: 4, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 17,
    name: "Dogo Argentino",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 292",
    fci_origin: "Argentina",
    description: "Atleta de caza mayor de gran valor físico. Muy afectuoso con la familia pero requiere manejo experto ante perros del mismo sexo.",
    energy_level: 4, prey_drive: 5, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 18,
    name: "San Bernardo",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 61",
    fci_origin: "Suiza",
    description: "Gigante pacífico y bondadoso. Muy calmado, requiere paseos relajados y control de temperatura en climas cálidos.",
    energy_level: 2, prey_drive: 2, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 19,
    name: "Boyero de Berna",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 45",
    fci_origin: "Suiza",
    description: "Perro tricolor pacífico, dócil y equilibrado. Excelente compañero familiar con bajo perfil de reactividad agresiva.",
    energy_level: 3, prey_drive: 2, sensitivity: 4, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 20,
    name: "Schnauzer Gigante",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 181",
    fci_origin: "Alemania",
    description: "Perro de trabajo imponente, inteligente y guardián. Su reactividad proviene de instintos defensivos si no se ejercita adecuadamente.",
    energy_level: 4, prey_drive: 4, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 21,
    name: "Schnauzer Mediano",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 182",
    fci_origin: "Alemania",
    description: "Raza original de barba característica. Muy vivaz, leal y alerta con tendencia a vocalizar ante desconocidos.",
    energy_level: 4, prey_drive: 3, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 22,
    name: "Schnauzer Miniatura",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 183",
    fci_origin: "Alemania",
    description: "Pequeño guardián compacto e intrépido. Propenso a reactividad por ladrido alerta hacia personas o perros que se aproximan.",
    energy_level: 4, prey_drive: 3, sensitivity: 4, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 23,
    name: "Cane Corso (Mastín Italiano)",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 343",
    fci_origin: "Italia",
    description: "Moloso de guardia italiano robusto y equilibrado. Protector nato de su núcleo familiar, requiere liderazgo sereno.",
    energy_level: 3, prey_drive: 4, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 24,
    name: "Mastín Español",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 91",
    fci_origin: "España",
    description: "Guardián de ganado ibérico noble y nobleza rústica. De ladrido grave y potente, calmo pero inamovible ante amenazas.",
    energy_level: 2, prey_drive: 3, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 25,
    name: "Presa Canario (Dogo Canario)",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 346",
    fci_origin: "España",
    description: "Moloso autóctono de las Islas Canarias. Potente, seguro y reservado con extraños; requiere manejo con experiencia.",
    energy_level: 3, prey_drive: 4, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 26,
    name: "Mastín Inglés",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 264",
    fci_origin: "Gran Bretaña",
    description: "Una de las razas más pesadas del mundo. Temperamento extremadamente manso, afectuoso y pacífico.",
    energy_level: 2, prey_drive: 2, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 27,
    name: "Terranova (Newfoundland)",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 50",
    fci_origin: "Canadá / FCI",
    description: "Famoso perro de rescate acuático de alma benévola. Amable con niños y totalmente falto de agresividad.",
    energy_level: 2, prey_drive: 2, sensitivity: 4, arousal_threshold: 1,
    image_url: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 28,
    name: "Shar Pei",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 307",
    fci_origin: "China / FCI",
    description: "Raza china de pliegues característicos e índole independiente. Puede manifestar reactividad hacia otros perros si invaden su distancia de confort.",
    energy_level: 3, prey_drive: 3, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 29,
    name: "Bullmastiff",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 157",
    fci_origin: "Gran Bretaña",
    description: "Antiguo guardián de cotos de caza. Retiene al intruso sin morder de forma innecesaria; paciente y equilibrado.",
    energy_level: 3, prey_drive: 3, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 30,
    name: "Pinscher Miniatura",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 185",
    fci_origin: "Alemania",
    description: "El 'Rey de los Toys' de elegancia altiva. Lleno de temperamento, guardián diminuto y de reacción veloz.",
    energy_level: 5, prey_drive: 4, sensitivity: 4, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80"
  },

  // --- GRUPO 3: TERRIERS ---
  {
    id: 31,
    name: "American Staffordshire Terrier",
    fci_group: "Grupo 3: Terriers",
    fci_standard: "FCI N° 286",
    fci_origin: "Estados Unidos",
    description: "Perro atlético, afectuoso y de gran potencia física. Muy vinculado a su familia; susceptible a reactividad defensiva por tensión en la correa.",
    energy_level: 4, prey_drive: 4, sensitivity: 4, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 32,
    name: "Staffordshire Bull Terrier",
    fci_group: "Grupo 3: Terriers",
    fci_standard: "FCI N° 76",
    fci_origin: "Gran Bretaña",
    description: "Conocido en Reino Unido como 'el perro niñera' por su amor a las personas. Tenaz y lleno de energía en juegos físicos.",
    energy_level: 4, prey_drive: 4, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 33,
    name: "Bull Terrier",
    fci_group: "Grupo 3: Terriers",
    fci_standard: "FCI N° 11",
    fci_origin: "Gran Bretaña",
    description: "Perro de cabeza ovoidal inconfundible. Juguetón, alegre y tozudo; su reactividad deriva de sobre-excitación intensa.",
    energy_level: 4, prey_drive: 4, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 34,
    name: "Jack Russell Terrier",
    fci_group: "Grupo 3: Terriers",
    fci_standard: "FCI N° 345",
    fci_origin: "Australia / Gran Bretaña",
    description: "Pequeño terrier de enorme impulso de caza inagotable. Reacciona velozmente ante estímulos repentinos y movimiento de presa.",
    energy_level: 5, prey_drive: 5, sensitivity: 3, arousal_threshold: 5,
    image_url: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 35,
    name: "Yorkshire Terrier",
    fci_group: "Grupo 3: Terriers",
    fci_standard: "FCI N° 86",
    fci_origin: "Gran Bretaña",
    description: "Popular perro de compañía pero con alma de cazador de alimañas. Tiende a la reactividad vocal preventiva por miedo o inseguridad.",
    energy_level: 4, prey_drive: 4, sensitivity: 4, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 36,
    name: "West Highland White Terrier (Westie)",
    fci_group: "Grupo 3: Terriers",
    fci_standard: "FCI N° 85",
    fci_origin: "Gran Bretaña",
    description: "Terrier blanco escocés alegre y decidido. Alerta y muy independiente en paseos.",
    energy_level: 4, prey_drive: 4, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 37,
    name: "Fox Terrier de Pelo Duro",
    fci_group: "Grupo 3: Terriers",
    fci_standard: "FCI N° 169",
    fci_origin: "Gran Bretaña",
    description: "Raza elegante y vibrante. Impulso de caza inagotable hacia roedores y animales pequeños.",
    energy_level: 5, prey_drive: 5, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 38,
    name: "Airedale Terrier",
    fci_group: "Grupo 3: Terriers",
    fci_standard: "FCI N° 7",
    fci_origin: "Gran Bretaña",
    description: "El 'Rey de los Terriers', la raza de mayor tamaño del grupo. Inteligente, valiente y de temperamento noble.",
    energy_level: 4, prey_drive: 4, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 39,
    name: "Scottish Terrier",
    fci_group: "Grupo 3: Terriers",
    fci_standard: "FCI N° 73",
    fci_origin: "Gran Bretaña",
    description: "El icónico terrier escocés de silueta inconfundible. Serio, reservado con desconocidos e independiente.",
    energy_level: 3, prey_drive: 4, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 40,
    name: "Terrier Irlandés",
    fci_group: "Grupo 3: Terriers",
    fci_standard: "FCI N° 139",
    fci_origin: "Irlanda",
    description: "Perro rojo apasionado y audaz. Famoso por su lealtad inquebrantable a su dueño.",
    energy_level: 4, prey_drive: 4, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=600&q=80"
  },

  // --- GRUPO 4: TECKELS (DACHSHUNDS) ---
  {
    id: 41,
    name: "Teckel / Dachshund Escribano (Standard)",
    fci_group: "Grupo 4: Teckels",
    fci_standard: "FCI N° 148",
    fci_origin: "Alemania",
    description: "El famoso perro salchicha cazador de tejoneras. Valiente, tenaz y con voz potente. Susceptible a reactividad por frustración vocal.",
    energy_level: 4, prey_drive: 5, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 42,
    name: "Teckel Miniatura",
    fci_group: "Grupo 4: Teckels",
    fci_standard: "FCI N° 148-Mini",
    fci_origin: "Alemania",
    description: "Variedad pequeña de gran personalidad. Muy astuto, protector de su hogar y alerta a ruidos en la puerta.",
    energy_level: 4, prey_drive: 4, sensitivity: 4, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80"
  },

  // --- GRUPO 5: SPITZ Y TIPO PRIMITIVO ---
  {
    id: 43,
    name: "Husky Siberiano",
    fci_group: "Grupo 5: Perros tipo Spitz y Primitivo",
    fci_standard: "FCI N° 270",
    fci_origin: "EEUU / Rusia",
    description: "Perro de tiro de trineo independiente y aullador. Inagotable impulso de presa hacia gatos y aves; requiere paseo con arnés seguro.",
    energy_level: 5, prey_drive: 5, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 44,
    name: "Malamute de Alaska",
    fci_group: "Grupo 5: Perros tipo Spitz y Primitivo",
    fci_standard: "FCI N° 243",
    fci_origin: "Estados Unidos",
    description: "Poderoso perro de trineo ártico de fuerte constitución. Muy noble con personas, pero puede mostrar dominancia con perros del mismo sexo.",
    energy_level: 4, prey_drive: 5, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 45,
    name: "Samoyedo",
    fci_group: "Grupo 5: Perros tipo Spitz y Primitivo",
    fci_standard: "FCI N° 212",
    fci_origin: "Rusia",
    description: "La 'sonrisa del samoyedo'. Perro nórdico blanco de alma amistosa y juguetona. Tiende a la vocalización por entusiasmo.",
    energy_level: 4, prey_drive: 3, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 46,
    name: "Shiba Inu",
    fci_group: "Grupo 5: Perros tipo Spitz y Primitivo",
    fci_standard: "FCI N° 257",
    fci_origin: "Japón",
    description: "Raza japonesa ancestral de temperamento limpio e independiente tipo felino. Alta reactividad ante invasión de su espacio vital por otros perros.",
    energy_level: 3, prey_drive: 4, sensitivity: 4, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 47,
    name: "Akita Inu",
    fci_group: "Grupo 5: Perros tipo Spitz y Primitivo",
    fci_standard: "FCI N° 255",
    fci_origin: "Japón",
    description: "Símbolo nacional de lealtad en Japón (Hachiko). Sereno, digno y muy reservado; exige distancia social con perros extraños.",
    energy_level: 3, prey_drive: 4, sensitivity: 4, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 48,
    name: "Akita Americano",
    fci_group: "Grupo 5: Perros tipo Spitz y Primitivo",
    fci_standard: "FCI N° 344",
    fci_origin: "Japón / EEUU",
    description: "Moloso tipo Spitz potente e imponente. Protector nato de su hogar y familia.",
    energy_level: 3, prey_drive: 4, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 49,
    name: "Chow Chow",
    fci_group: "Grupo 5: Perros tipo Spitz y Primitivo",
    fci_standard: "FCI N° 205",
    fci_origin: "China",
    description: "Perro chino de lengua azul y temperamento distante y leonino. Muy independiente; requiere respetar su distancia de confort.",
    energy_level: 2, prey_drive: 3, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 50,
    name: "Basenji",
    fci_group: "Grupo 5: Perros tipo Spitz y Primitivo",
    fci_standard: "FCI N° 43",
    fci_origin: "África Central",
    description: "El 'perro que no ladra' de origen africano primigenio. Emite un canto tirolés peculiar (canto yodel); independiente y muy curioso.",
    energy_level: 4, prey_drive: 5, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 51,
    name: "Pomerania (Spitz Alemán Enano)",
    fci_group: "Grupo 5: Perros tipo Spitz y Primitivo",
    fci_standard: "FCI N° 97",
    fci_origin: "Alemania",
    description: "Pequeño copo de algodón lleno de energía y vivacidad. Alerta a ruidos con tendencia a la reactividad vocal preventiva.",
    energy_level: 4, prey_drive: 2, sensitivity: 4, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 52,
    name: "Perro Sin Pelo del Perú",
    fci_group: "Grupo 5: Perros tipo Spitz y Primitivo",
    fci_standard: "FCI N° 310",
    fci_origin: "Perú",
    description: "Patrimonio nacional peruano sin pelo. Perro afectuoso, cálido al tacto y guardián reservado.",
    energy_level: 3, prey_drive: 3, sensitivity: 5, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 53,
    name: "Xoloitzcuintle",
    fci_group: "Grupo 5: Perros tipo Spitz y Primitivo",
    fci_standard: "FCI N° 234",
    fci_origin: "México",
    description: "Perro sagrado azteca de México. Silencioso, inteligente y de temperamento noble y protector.",
    energy_level: 3, prey_drive: 3, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
  },

  // --- GRUPO 6: PERROS TIPO SABUESO Y RASTRO ---
  {
    id: 54,
    name: "Beagle",
    fci_group: "Grupo 6: Perros tipo Sabueso",
    fci_standard: "FCI N° 163",
    fci_origin: "Gran Bretaña",
    description: "Sabueso guiado por el olfato, alegre y curioso. Su impulso de seguimiento de rastros causa tirones intensos de correa.",
    energy_level: 4, prey_drive: 5, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 55,
    name: "Basset Hound",
    fci_group: "Grupo 6: Perros tipo Sabueso",
    fci_standard: "FCI N° 163-B",
    fci_origin: "Gran Bretaña",
    description: "Sabueso de orejas largas y gran olfato. Paciente y apacible, aunque obstinado si encuentra un rastro de olor.",
    energy_level: 2, prey_drive: 5, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 56,
    name: "Dálmata",
    fci_group: "Grupo 6: Perros tipo Sabueso",
    fci_standard: "FCI N° 153",
    fci_origin: "Croacia",
    description: "Famoso perro de carruajes manchado. Muy atlético e inagotable; requiere alta dosis de ejercicio diario para evitar reactividad en casa.",
    energy_level: 5, prey_drive: 3, sensitivity: 4, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 57,
    name: "Bloodhound (Perro de San Huberto)",
    fci_group: "Grupo 6: Perros tipo Sabueso",
    fci_standard: "FCI N° 84",
    fci_origin: "Bélgica",
    description: "El rastreador olfativo más potente de la naturaleza. De temperamento dócil, tranquilo y apacible.",
    energy_level: 3, prey_drive: 5, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 58,
    name: "Rhodesian Ridgeback",
    fci_group: "Grupo 6: Perros tipo Sabueso",
    fci_standard: "FCI N° 146",
    fci_origin: "Sudáfrica",
    description: "Perro africano con cresta dorsal característica. Antiguo cazador de leones; fuerte, atlético y reservado con extraños.",
    energy_level: 4, prey_drive: 4, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
  },

  // --- GRUPO 7: PERROS DE MUESTRA (POINTERS Y SETTERS) ---
  {
    id: 59,
    name: "Pointer Inglés",
    fci_group: "Grupo 7: Perros de Muestra",
    fci_standard: "FCI N° 1",
    fci_origin: "Gran Bretaña",
    description: "El atleta de muestra por excelencia. Velocidad pura en campo abierto e instinto de petrificación o muestra ante aves.",
    energy_level: 5, prey_drive: 5, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 60,
    name: "Setter Irlandés Rojo",
    fci_group: "Grupo 7: Perros de Muestra",
    fci_standard: "FCI N° 120",
    fci_origin: "Irlanda",
    description: "Perro de pelaje caoba radiante, aristocrático y efusivo. Lleno de energía y afecto con las personas.",
    energy_level: 5, prey_drive: 4, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 61,
    name: "Setter Inglés",
    fci_group: "Grupo 7: Perros de Muestra",
    fci_standard: "FCI N° 2",
    fci_origin: "Gran Bretaña",
    description: "Elegante cazador moteado de carácter dulce y pacífico en el hogar. Excelente compañero.",
    energy_level: 4, prey_drive: 4, sensitivity: 4, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 62,
    name: "Braco Alemán de Pelo Corto",
    fci_group: "Grupo 7: Perros de Muestra",
    fci_standard: "FCI N° 119",
    fci_origin: "Alemania",
    description: "Cazador polivalente e infatigable. Altísimo nivel de energía que exige ejercicio diario intenso para mantener la calma.",
    energy_level: 5, prey_drive: 5, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 63,
    name: "Weimaraner (Braco de Weimar)",
    fci_group: "Grupo 7: Perros de Muestra",
    fci_standard: "FCI N° 99",
    fci_origin: "Alemania",
    description: "El 'Fantasma Gris' de ojos expresivos. Perro muy apegado al guía, propenso a ansiedad por separación si se le deja solo.",
    energy_level: 5, prey_drive: 4, sensitivity: 5, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 64,
    name: "Vizsla (Braco Húngaro)",
    fci_group: "Grupo 7: Perros de Muestra",
    fci_standard: "FCI N° 57",
    fci_origin: "Hungría",
    description: "Perro cazador dorado extremadamente sensible y afectuoso. Le llaman el 'perro velcro' por su necesidad constante de cercanía.",
    energy_level: 5, prey_drive: 4, sensitivity: 5, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=600&q=80"
  },

  // --- GRUPO 8: COBRADORES Y PERROS DE AGUA ---
  {
    id: 65,
    name: "Golden Retriever",
    fci_group: "Grupo 8: Cobradores y Perros de Agua",
    fci_standard: "FCI N° 111",
    fci_origin: "Gran Bretaña",
    description: "Perro cobrador equilibrado y adaptable. Su reactividad suele derivar de la sobre-excitación social amistosa en paseos.",
    energy_level: 4, prey_drive: 3, sensitivity: 4, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 66,
    name: "Labrador Retriever",
    fci_group: "Grupo 8: Cobradores y Perros de Agua",
    fci_standard: "FCI N° 122",
    fci_origin: "Gran Bretaña",
    description: "Entusiasta, glotón y noble. Excelente perro de asistencia con gran templanza en ambientes urbanos.",
    energy_level: 4, prey_drive: 3, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 67,
    name: "Cocker Spaniel Inglés",
    fci_group: "Grupo 8: Cobradores y Perros de Agua",
    fci_standard: "FCI N° 5",
    fci_origin: "Gran Bretaña",
    description: "Spaniel alegre de orejas caídas y cola movediza. Requiere estimulación olfativa regular en parques.",
    energy_level: 4, prey_drive: 4, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 68,
    name: "Cocker Spaniel Americano",
    fci_group: "Grupo 8: Cobradores y Perros de Agua",
    fci_standard: "FCI N° 167",
    fci_origin: "Estados Unidos",
    description: "Variedad de abundante manto sedoso. Dulce, cariñoso y sensible a ruidos fuertes.",
    energy_level: 3, prey_drive: 3, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 69,
    name: "English Springer Spaniel",
    fci_group: "Grupo 8: Cobradores y Perros de Agua",
    fci_standard: "FCI N° 125",
    fci_origin: "Gran Bretaña",
    description: "El ancestro de los spaniels de caza. Atlético, leal y excelente nadador.",
    energy_level: 4, prey_drive: 4, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 70,
    name: "Perro de Agua Español",
    fci_group: "Grupo 8: Cobradores y Perros de Agua",
    fci_standard: "FCI N° 336",
    fci_origin: "España",
    description: "Raza autóctona de pelo rizado en cordones. Polivalente pastor, cazador y pescador; reservado con extraños.",
    energy_level: 4, prey_drive: 4, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 71,
    name: "Perro de Agua Portugués",
    fci_group: "Grupo 8: Cobradores y Perros de Agua",
    fci_standard: "FCI N° 37",
    fci_origin: "Portugal",
    description: "Famoso perro de marinero de temperamento atlético e inteligente. Amante del agua y fácil de adiestrar.",
    energy_level: 4, prey_drive: 3, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=600&q=80"
  },

  // --- GRUPO 9: PERROS DE COMPAÑÍA ---
  {
    id: 72,
    name: "Caniche / Poodle Gigante",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 172",
    fci_origin: "Francia",
    description: "Una de las razas más inteligentes del planeta. Altamente adiestrable, elegante e hipoalergénico.",
    energy_level: 4, prey_drive: 3, sensitivity: 4, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 73,
    name: "Caniche / Poodle Miniatura",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 172-M",
    fci_origin: "Francia",
    description: "Variedad mediana vivaz, intuitiva y rápida para aprender trucos y normas de convivencia.",
    energy_level: 4, prey_drive: 2, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 74,
    name: "Caniche / Poodle Toy",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 172-T",
    fci_origin: "Francia",
    description: "Pequeño acompañante urbano muy cariñoso. Requiere no ser sobreprotegido para evitar miedos a perros grandes.",
    energy_level: 3, prey_drive: 2, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 75,
    name: "Bulldog Francés",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 101",
    fci_origin: "Francia",
    description: "Pequeño moloso con orejas de murciélago. Cómico, cariñoso y poco ladrador; ideal para vida en apartamento.",
    energy_level: 2, prey_drive: 2, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 76,
    name: "Bulldog Inglés",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 149",
    fci_origin: "Gran Bretaña",
    description: "El símbolo británico de compostura y paz. Calmo, afectuoso e insensible a provocaciones menores.",
    energy_level: 1, prey_drive: 1, sensitivity: 2, arousal_threshold: 1,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 77,
    name: "Pug / Carlino",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 253",
    fci_origin: "China",
    description: "Antiguo perro imperial chino de cara arrugada. Juguetón, fiel y amante del descanso en sofás.",
    energy_level: 2, prey_drive: 1, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 78,
    name: "Shih Tzu",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 208",
    fci_origin: "Tíbet / China",
    description: "El 'perro león' tibetano. Dulce, confiado y amigable con todas las personas y mascotas.",
    energy_level: 2, prey_drive: 1, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 79,
    name: "Bichón Frisé",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 215",
    fci_origin: "Francia / Bélgica",
    description: "Pequeña nube blanca jovial y alegre. Disfruta los juegos familiares y convive pacíficamente.",
    energy_level: 3, prey_drive: 1, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 80,
    name: "Bichón Maltés",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 65",
    fci_origin: "Mediterráneo / FCI",
    description: "Compañero milenario de manto blanco sedoso. Muy refinado, inteligente y apegado.",
    energy_level: 3, prey_drive: 1, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 81,
    name: "Chihuahua / Chihuahueño",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 218",
    fci_origin: "México",
    description: "La raza más pequeña del mundo de enorme personalidad. Valiente y protector; propenso a reactividad si se siente amenazado.",
    energy_level: 3, prey_drive: 2, sensitivity: 5, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 82,
    name: "Cavalier King Charles Spaniel",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 136",
    fci_origin: "Gran Bretaña",
    description: "Spaniel de compañía de mirada tierna y orejas sedosas. Dulce, pacifico e incapaz de agresión.",
    energy_level: 3, prey_drive: 2, sensitivity: 4, arousal_threshold: 1,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 83,
    name: "Pekinés",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 207",
    fci_origin: "China",
    description: "Perro sagrado de los palacios imperiales de Pekín. Independiente, altivo y de gran dignidad.",
    energy_level: 2, prey_drive: 1, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 84,
    name: "Papillón (Épagneul Nain)",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 77",
    fci_origin: "Francia / Bélgica",
    description: "El 'perro mariposa' por la forma de sus orejas. Una de las razas pequeñas más inteligentes del mundo.",
    energy_level: 4, prey_drive: 2, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 85,
    name: "Lhasa Apso",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 227",
    fci_origin: "Tíbet / FCI",
    description: "Antiguo centinela de los monasterios tibetanos. Alerta, independiente y de oído fino.",
    energy_level: 3, prey_drive: 2, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 86,
    name: "Boston Terrier",
    fci_group: "Grupo 9: Perros de Compañía",
    fci_standard: "FCI N° 140",
    fci_origin: "Estados Unidos",
    description: "El 'Caballero Americano' por su pelaje tipo smoking. Amable, inteligente e ideal para paseos urbanos.",
    energy_level: 3, prey_drive: 2, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=600&q=80"
  },

  // --- GRUPO 10: LEBRELES (GREYHOUNDS) ---
  {
    id: 87,
    name: "Galgo Español",
    fci_group: "Grupo 10: Lebreles",
    fci_standard: "FCI N° 285",
    fci_origin: "España",
    description: "Lebrel ibérico milenario. Veloz en campo abierto pero extraordinariamente dulce, tranquilo y silencioso en el hogar.",
    energy_level: 4, prey_drive: 5, sensitivity: 5, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 88,
    name: "Greyhound (Lebrel Inglés)",
    fci_group: "Grupo 10: Lebreles",
    fci_standard: "FCI N° 158",
    fci_origin: "Gran Bretaña",
    description: "El atleta de carreras más rápido de la especie canina (hasta 70 km/h). Manso, noble y muy dormilón.",
    energy_level: 4, prey_drive: 5, sensitivity: 4, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 89,
    name: "Whippet",
    fci_group: "Grupo 10: Lebreles",
    fci_standard: "FCI N° 162",
    fci_origin: "Gran Bretaña",
    description: "Miniatura del Greyhound de velocidad prodigiosa. Silencioso, afectuoso y perfecto para vivir en departamento.",
    energy_level: 4, prey_drive: 4, sensitivity: 5, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 90,
    name: "Lebrel Afgano",
    fci_group: "Grupo 10: Lebreles",
    fci_standard: "FCI N° 228",
    fci_origin: "Afganistán",
    description: "El rey de los lebreles por su manto sedoso y porte regio. Independiente, orgulloso y de instinto de caza veloz.",
    energy_level: 4, prey_drive: 5, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 91,
    name: "Pequeño Lebrel Italiano",
    fci_group: "Grupo 10: Lebreles",
    fci_standard: "FCI N° 199",
    fci_origin: "Italia",
    description: "Miniatura aristocrática de gran delicadeza física y afecto. Requiere cuidado especial de saltos altos.",
    energy_level: 3, prey_drive: 3, sensitivity: 5, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 92,
    name: "Borzoi (Lebrel Ruso)",
    fci_group: "Grupo 10: Lebreles",
    fci_standard: "FCI N° 193",
    fci_origin: "Rusia",
    description: "Antiguo lebrel imperial ruso para caza de lobos. De porte aristocrático, silencioso y sereno.",
    energy_level: 3, prey_drive: 5, sensitivity: 4, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 93,
    name: "Irish Wolfhound (Lobero Irlandés)",
    fci_group: "Grupo 10: Lebreles",
    fci_standard: "FCI N° 160",
    fci_origin: "Irlanda",
    description: "La raza de perro más alta del mundo. Gigante gentil de temperamento sumamente pacifico.",
    energy_level: 3, prey_drive: 4, sensitivity: 4, arousal_threshold: 1,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 94,
    name: "Azawakh",
    fci_group: "Grupo 10: Lebreles",
    fci_standard: "FCI N° 307",
    fci_origin: "Malí / FCI",
    description: "Lebrel del desierto del Sáhara. Altamente reservado con extraños, leal solo a su guía.",
    energy_level: 4, prey_drive: 5, sensitivity: 5, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 95,
    name: "Saluki (Lebrel Real de Persia)",
    fci_group: "Grupo 10: Lebreles",
    fci_standard: "FCI N° 269",
    fci_origin: "Oriente Medio",
    description: "Una de las razas más antiguas de la humanidad. Grácil, veloz e independiente.",
    energy_level: 4, prey_drive: 5, sensitivity: 4, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 96,
    name: "Sloughi (Lebrel Árabe)",
    fci_group: "Grupo 10: Lebreles",
    fci_standard: "FCI N° 188",
    fci_origin: "Marruecos",
    description: "Lebrel norteafricano de mirada melancólica y veloz galope.",
    energy_level: 4, prey_drive: 5, sensitivity: 4, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },

  // --- RAZAS ADICIONALES DE TRABAJO Y MOLOSOS ---
  {
    id: 97,
    name: "Dogo de Burdeos",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 116",
    fci_origin: "Francia",
    description: "Moloso francés de cabeza masiva y mirada conmovedora. Calmo, afectuoso e insuperable compañero.",
    energy_level: 2, prey_drive: 3, sensitivity: 3, arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 98,
    name: "Fila Brasileiro",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 221",
    fci_origin: "Brasil",
    description: "Gran moloso brasileño de rastreo y guardia. Caracterizado por su ojeriza (desconfianza instintiva) con extraños.",
    energy_level: 3, prey_drive: 5, sensitivity: 3, arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 99,
    name: "Kangal (Perro Pastor de Anatolia)",
    fci_group: "Grupo 2: Pinscher y Schnauzer - Molosoides",
    fci_standard: "FCI N° 331",
    fci_origin: "Turquía",
    description: "El gigante turco guardián de rebaños contra lobos. Sereno pero de fuerza física imponente.",
    energy_level: 3, prey_drive: 4, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 100,
    name: "Mestizo (Criollo)",
    fci_group: "Mestizo / Raza Combinada",
    fci_standard: "No Estandarizado",
    fci_origin: "Global",
    description: "Perro de ascendencia combinada con gran adaptabilidad y vigor híbrido. Perfil temperamental personalizado.",
    energy_level: 3, prey_drive: 3, sensitivity: 3, arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
  }
];
