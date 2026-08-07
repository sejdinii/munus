/**
 * European location catalog for onboarding (founder feedback 2026-08-07:
 * "every possible location on Europe"). Grouped by country, searchable;
 * multi-select in the UI. Includes capitals + major hiring hubs.
 */

export interface CountryGroup {
  country: string;
  cities: readonly string[];
}

export const EUROPE_LOCATIONS: readonly CountryGroup[] = [
  { country: "Germany", cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Leipzig", "Dresden", "Nuremberg", "Hannover", "Bremen", "Dortmund", "Essen", "Karlsruhe", "Mannheim", "Bonn", "Münster", "Freiburg", "Aachen", "Heidelberg", "Regensburg", "Mainz", "Wiesbaden", "Erlangen", "Ulm", "Bochum", "Kiel", "Rostock", "Saarbrücken", "Augsburg", "Göttingen", "Jena", "Potsdam", "Darmstadt", "Tübingen"] },
  { country: "United Kingdom", cities: ["London", "Manchester", "Birmingham", "Edinburgh", "Glasgow", "Bristol", "Leeds", "Liverpool", "Newcastle", "Sheffield", "Nottingham", "Oxford", "Cambridge", "Cardiff", "Belfast", "Brighton", "Reading", "Southampton", "Portsmouth", "Coventry", "Leicester", "York", "Guildford", "Aberdeen", "Dundee", "Swansea", "Exeter", "Bath", "Windsor"] },
  { country: "Netherlands", cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Leiden", "Delft", "Tilburg", "Maastricht", "Zwolle", "Breda", "Nijmegen", "Haarlem", "Amersfoort"] },
  { country: "Belgium", cities: ["Brussels", "Antwerp", "Ghent", "Bruges", "Leuven", "Liège", "Charleroi", "Namur", "Mechelen", "Hasselt"] },
  { country: "Luxembourg", cities: ["Luxembourg City"] },
  { country: "France", cities: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux", "Lille", "Montpellier", "Rennes", "Grenoble", "Toulon", "Dijon", "Angers", "Le Havre", "Reims", "Aix-en-Provence", "Biarritz", "Brest"] },
  { country: "Spain", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Bilbao", "Palma de Mallorca", "Alicante", "Murcia", "Granada", "Vigo", "A Coruña", "San Sebastián", "Valladolid", "Pamplona", "Tenerife", "Las Palmas"] },
  { country: "Portugal", cities: ["Lisbon", "Porto", "Braga", "Coimbra", "Faro", "Aveiro", "Cascais", "Sintra", "Setúbal", "Funchal"] },
  { country: "Italy", cities: ["Milan", "Rome", "Turin", "Naples", "Bologna", "Florence", "Venice", "Verona", "Genoa", "Palermo", "Catania", "Bari", "Padua", "Brescia", "Parma", "Modena", "Cagliari", "Trieste", "Como", "Bergamo"] },
  { country: "Switzerland", cities: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Lucerne", "Lugano", "Winterthur", "St. Gallen", "Fribourg", "Neuchâtel"] },
  { country: "Austria", cities: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach", "Wels", "Bregenz"] },
  { country: "Ireland", cities: ["Dublin", "Cork", "Galway", "Limerick", "Waterford", "Kilkenny", "Athlone", "Sligo"] },
  { country: "Sweden", cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Linköping", "Lund", "Örebro", "Västerås", "Helsingborg", "Umeå", "Sundsvall"] },
  { country: "Norway", cities: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Kristiansand", "Tromsø", "Sandnes", "Ålesund"] },
  { country: "Denmark", cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Vejle", "Horsens"] },
  { country: "Finland", cities: ["Helsinki", "Espoo", "Tampere", "Turku", "Oulu", "Jyväskylä", "Lahti", "Kuopio", "Vaasa", "Rovaniemi"] },
  { country: "Iceland", cities: ["Reykjavík", "Kópavogur", "Akureyri"] },
  { country: "Estonia", cities: ["Tallinn", "Tartu", "Pärnu", "Narva"] },
  { country: "Latvia", cities: ["Riga", "Daugavpils", "Liepāja", "Jūrmala"] },
  { country: "Lithuania", cities: ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys"] },
  { country: "Poland", cities: ["Warsaw", "Kraków", "Wrocław", "Poznań", "Gdańsk", "Łódź", "Katowice", "Szczecin", "Lublin", "Bydgoszcz", "Białystok", "Gdynia", "Sopot", "Toruń", "Rzeszów", "Olsztyn", "Zielona Góra", "Opole", "Kielce"] },
  { country: "Czech Republic", cities: ["Prague", "Brno", "Ostrava", "Plzeň", "Olomouc", "Liberec", "České Budějovice", "Hradec Králové", "Pardubice"] },
  { country: "Slovakia", cities: ["Bratislava", "Košice", "Prešov", "Žilina", "Nitra", "Banská Bystrica", "Trnava", "Trenčín"] },
  { country: "Hungary", cities: ["Budapest", "Debrecen", "Szeged", "Győr", "Pécs", "Miskolc", "Székesfehérvár", "Kecskemét", "Sopron"] },
  { country: "Romania", cities: ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Brașov", "Constanța", "Craiova", "Sibiu", "Oradea", "Arad", "Galați", "Ploiești"] },
  { country: "Bulgaria", cities: ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora", "Pleven"] },
  { country: "Greece", cities: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos", "Rhodes", "Corfu"] },
  { country: "Croatia", cities: ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Dubrovnik", "Pula"] },
  { country: "Slovenia", cities: ["Ljubljana", "Maribor", "Celje", "Kranj", "Koper"] },
  { country: "Serbia", cities: ["Belgrade", "Novi Sad", "Niš", "Kragujevac", "Subotica"] },
  { country: "Bosnia & Herzegovina", cities: ["Sarajevo", "Banja Luka", "Mostar", "Tuzla"] },
  { country: "Montenegro", cities: ["Podgorica", "Nikšić", "Kotor"] },
  { country: "North Macedonia", cities: ["Skopje", "Bitola", "Ohrid", "Kumanovo", "Tetovo"] },
  { country: "Albania", cities: ["Tirana", "Durrës", "Vlorë", "Shkodër"] },
  { country: "Kosovo", cities: ["Pristina", "Prizren", "Peja", "Gjakova"] },
  { country: "Malta", cities: ["Valletta", "Sliema", "St. Julian's", "Birkirkara", "Mosta", "Qormi"] },
  { country: "Cyprus", cities: ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta"] },
  { country: "Ukraine", cities: ["Kyiv", "Lviv", "Odesa", "Kharkiv", "Dnipro", "Vinnytsia", "Zaporizhzhia", "Ivano-Frankivsk"] },
  { country: "Moldova", cities: ["Chișinău", "Bălți", "Tiraspol"] },
  { country: "Georgia", cities: ["Tbilisi", "Batumi", "Kutaisi"] },
  { country: "Armenia", cities: ["Yerevan", "Gyumri", "Vanadzor"] },
  { country: "Türkiye (European side)", cities: ["Istanbul (European side)", "Edirne"] },
  { country: "Monaco", cities: ["Monaco"] },
  { country: "Andorra", cities: ["Andorra la Vella"] },
  { country: "San Marino", cities: ["San Marino"] },
];

export const ALL_CITIES: readonly string[] = EUROPE_LOCATIONS.flatMap((g) => g.cities);

/** Case-insensitive search across country + city names. */
export function searchLocations(query: string): CountryGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...EUROPE_LOCATIONS];
  return EUROPE_LOCATIONS.map((g) => ({
    country: g.country,
    cities: g.cities.filter(
      (c) => c.toLowerCase().includes(q) || g.country.toLowerCase().includes(q),
    ),
  })).filter((g) => g.cities.length > 0);
}
