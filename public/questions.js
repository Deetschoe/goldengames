const QUESTIONS = [
  // ---------------------------------------------------------------
  // Golden Oldies (Music & TV)
  // ---------------------------------------------------------------
  {
    id: "golden-01",
    category: "Golden Oldies (Music & TV)",
    text: "Name a singer who could pack a concert hall back in your day.",
    answers: [
      { text: "Elvis", points: 30 },
      { text: "Frank Sinatra", points: 20 },
      { text: "Johnny Cash", points: 14 },
      { text: "Patsy Cline", points: 12 },
      { text: "Nat King Cole", points: 9 },
      { text: "Ray Charles", points: 7 },
      { text: "Bing Crosby", points: 6 }
    ]
  },
  {
    id: "golden-02",
    category: "Golden Oldies (Music & TV)",
    text: "Name a TV Western the whole family gathered around the set to watch.",
    answers: [
      { text: "Gunsmoke", points: 32 },
      { text: "Bonanza", points: 28 },
      { text: "The Rifleman", points: 18 },
      { text: "Rawhide", points: 12 },
      { text: "Maverick", points: 8 }
    ]
  },
  {
    id: "golden-03",
    category: "Golden Oldies (Music & TV)",
    text: "Name a show you never missed on a Sunday night.",
    answers: [
      { text: "Ed Sullivan", points: 36 },
      { text: "Walt Disney", points: 22 },
      { text: "Lassie", points: 16 },
      { text: "60 Minutes", points: 12 },
      { text: "Wild Kingdom", points: 8 },
      { text: "Candid Camera", points: 6 }
    ]
  },
  {
    id: "golden-04",
    category: "Golden Oldies (Music & TV)",
    text: "Name a dance craze everybody tried at least once.",
    answers: [
      { text: "The Twist", points: 30 },
      { text: "The Jitterbug", points: 18 },
      { text: "The Stroll", points: 13 },
      { text: "Mashed Potato", points: 11 },
      { text: "The Swim", points: 9 },
      { text: "The Watusi", points: 7 },
      { text: "The Pony", points: 6 },
      { text: "Shag", points: 4 }
    ]
  },
  {
    id: "golden-05",
    category: "Golden Oldies (Music & TV)",
    text: "Name a movie star all the girls swooned over.",
    answers: [
      { text: "Rock Hudson", points: 26 },
      { text: "Cary Grant", points: 22 },
      { text: "Paul Newman", points: 18 },
      { text: "James Dean", points: 16 },
      { text: "Clark Gable", points: 10 },
      { text: "Marlon Brando", points: 6 }
    ]
  },
  {
    id: "golden-06",
    category: "Golden Oldies (Music & TV)",
    text: "Name a way you listened to your music back then.",
    answers: [
      { text: "Radio", points: 34 },
      { text: "Records", points: 28 },
      { text: "8 Track", points: 18 },
      { text: "Jukebox", points: 12 },
      { text: "Cassette", points: 6 }
    ]
  },
  {
    id: "golden-07",
    category: "Golden Oldies (Music & TV)",
    text: "Name a Motown act that got everybody out on the dance floor.",
    answers: [
      { text: "The Supremes", points: 30 },
      { text: "Temptations", points: 24 },
      { text: "Four Tops", points: 16 },
      { text: "Marvin Gaye", points: 14 },
      { text: "Jackson 5", points: 9 },
      { text: "Stevie Wonder", points: 6 }
    ]
  },
  {
    id: "golden-08",
    category: "Golden Oldies (Music & TV)",
    text: "Name a game show you liked to watch in the afternoon.",
    answers: [
      { text: "Price Is Right", points: 30 },
      { text: "Jeopardy", points: 22 },
      { text: "Password", points: 14 },
      { text: "Match Game", points: 12 },
      { text: "Concentration", points: 10 },
      { text: "Family Feud", points: 8 }
    ]
  },
  {
    id: "golden-09",
    category: "Golden Oldies (Music & TV)",
    text: "Name a Beatles song everyone knew by heart.",
    answers: [
      { text: "Hey Jude", points: 34 },
      { text: "Yesterday", points: 26 },
      { text: "Let It Be", points: 20 },
      { text: "Twist and Shout", points: 12 },
      { text: "Help", points: 6 }
    ]
  },
  {
    id: "golden-10",
    category: "Golden Oldies (Music & TV)",
    text: "Name a variety show with singing, dancing, and comedy.",
    answers: [
      { text: "Carol Burnett", points: 28 },
      { text: "Lawrence Welk", points: 24 },
      { text: "Hee Haw", points: 18 },
      { text: "Sonny and Cher", points: 14 },
      { text: "Dean Martin", points: 10 },
      { text: "Andy Williams", points: 6 }
    ]
  },
  {
    id: "golden-11",
    category: "Golden Oldies (Music & TV)",
    text: "Name a sitcom that still makes you laugh out loud.",
    answers: [
      { text: "I Love Lucy", points: 32 },
      { text: "Andy Griffith", points: 24 },
      { text: "Honeymooners", points: 14 },
      { text: "Dick Van Dyke", points: 12 },
      { text: "Green Acres", points: 10 },
      { text: "Gomer Pyle", points: 8 }
    ]
  },
  {
    id: "golden-12",
    category: "Golden Oldies (Music & TV)",
    text: "Name something you heard on the radio besides music.",
    answers: [
      { text: "News", points: 34 },
      { text: "Weather", points: 26 },
      { text: "Ball Game", points: 20 },
      { text: "Commercials", points: 12 },
      { text: "Farm Report", points: 6 }
    ]
  },
  {
    id: "golden-13",
    category: "Golden Oldies (Music & TV)",
    text: "Name a soap opera folks planned their whole day around.",
    answers: [
      { text: "General Hospital", points: 30 },
      { text: "Guiding Light", points: 24 },
      { text: "Another World", points: 16 },
      { text: "Edge of Night", points: 12 },
      { text: "Dark Shadows", points: 10 },
      { text: "Secret Storm", points: 8 }
    ]
  },
  {
    id: "golden-14",
    category: "Golden Oldies (Music & TV)",
    text: "Name a family singing group you enjoyed listening to.",
    answers: [
      { text: "Osmonds", points: 32 },
      { text: "Carpenters", points: 26 },
      { text: "Everly Brothers", points: 18 },
      { text: "Andrews Sisters", points: 14 },
      { text: "Beach Boys", points: 8 }
    ]
  },
  {
    id: "golden-15",
    category: "Golden Oldies (Music & TV)",
    text: "Name a Christmas special the family watched every single year.",
    answers: [
      { text: "Rudolph", points: 34 },
      { text: "Frosty", points: 26 },
      { text: "Charlie Brown", points: 18 },
      { text: "Grinch", points: 14 },
      { text: "Perry Como", points: 6 }
    ]
  },

  // ---------------------------------------------------------------
  // Back in My Day
  // ---------------------------------------------------------------
  {
    id: "backinmyday-01",
    category: "Back in My Day",
    text: "Name the make of car you learned to drive in.",
    answers: [
      { text: "Ford", points: 34 },
      { text: "Chevrolet", points: 28 },
      { text: "Buick", points: 16 },
      { text: "Plymouth", points: 12 },
      { text: "Oldsmobile", points: 8 }
    ]
  },
  {
    id: "backinmyday-02",
    category: "Back in My Day",
    text: "Name a chore you had to finish before you could go out and play.",
    answers: [
      { text: "Dishes", points: 30 },
      { text: "Make the Bed", points: 20 },
      { text: "Take Out Trash", points: 16 },
      { text: "Sweep Floor", points: 12 },
      { text: "Feed Chickens", points: 10 },
      { text: "Mow the Lawn", points: 8 },
      { text: "Laundry", points: 4 }
    ]
  },
  {
    id: "backinmyday-03",
    category: "Back in My Day",
    text: "Name something that only cost a nickel when you were young.",
    answers: [
      { text: "Soda Pop", points: 28 },
      { text: "Candy Bar", points: 22 },
      { text: "Newspaper", points: 16 },
      { text: "Comic Book", points: 14 },
      { text: "Phone Call", points: 12 },
      { text: "Bus Ride", points: 8 }
    ]
  },
  {
    id: "backinmyday-04",
    category: "Back in My Day",
    text: "Name something you ordered right out of the Sears catalog.",
    answers: [
      { text: "Clothes", points: 30 },
      { text: "Shoes", points: 22 },
      { text: "Toys", points: 18 },
      { text: "Tools", points: 16 },
      { text: "Appliances", points: 12 }
    ]
  },
  {
    id: "backinmyday-05",
    category: "Back in My Day",
    text: "Name a job a teenager could get for the summer.",
    answers: [
      { text: "Babysitting", points: 30 },
      { text: "Paper Route", points: 22 },
      { text: "Soda Fountain", points: 16 },
      { text: "Farm Work", points: 12 },
      { text: "Grocery Store", points: 10 },
      { text: "Lifeguard", points: 8 }
    ]
  },
  {
    id: "backinmyday-06",
    category: "Back in My Day",
    text: "Name something folks did out on the front porch after supper.",
    answers: [
      { text: "Sit and Talk", points: 34 },
      { text: "Drink Sweet Tea", points: 24 },
      { text: "Shell Peas", points: 16 },
      { text: "Wave at Folks", points: 14 },
      { text: "Sing", points: 10 }
    ]
  },
  {
    id: "backinmyday-07",
    category: "Back in My Day",
    text: "Name something a young man did to impress his date.",
    answers: [
      { text: "Open the Door", points: 30 },
      { text: "Bring Flowers", points: 24 },
      { text: "Buy Her Dinner", points: 16 },
      { text: "Wash His Car", points: 14 },
      { text: "Comb His Hair", points: 10 },
      { text: "Dress Up", points: 6 }
    ]
  },
  {
    id: "backinmyday-08",
    category: "Back in My Day",
    text: "Name something you packed in the car for the drive-in movie.",
    answers: [
      { text: "Blankets", points: 28 },
      { text: "Pillows", points: 24 },
      { text: "Sodas", points: 16 },
      { text: "Bug Spray", points: 14 },
      { text: "Lawn Chairs", points: 10 },
      { text: "The Kids", points: 8 }
    ]
  },
  {
    id: "backinmyday-09",
    category: "Back in My Day",
    text: "Name something the milkman brought right up to your door.",
    answers: [
      { text: "Milk", points: 42 },
      { text: "Butter", points: 24 },
      { text: "Eggs", points: 16 },
      { text: "Cream", points: 10 },
      { text: "Buttermilk", points: 6 }
    ]
  },
  {
    id: "backinmyday-10",
    category: "Back in My Day",
    text: "Name something from your school days that kids do not do today.",
    answers: [
      { text: "Penmanship", points: 30 },
      { text: "Say the Pledge", points: 22 },
      { text: "Chalkboard", points: 16 },
      { text: "Milk Money", points: 14 },
      { text: "Slide Rule", points: 10 },
      { text: "Marbles", points: 8 }
    ]
  },
  {
    id: "backinmyday-11",
    category: "Back in My Day",
    text: "Name the best part of a Saturday morning when you were a kid.",
    answers: [
      { text: "Cartoons", points: 36 },
      { text: "Pancakes", points: 24 },
      { text: "Sleeping In", points: 18 },
      { text: "Cereal", points: 14 },
      { text: "Comics", points: 6 }
    ]
  },
  {
    id: "backinmyday-12",
    category: "Back in My Day",
    text: "Name a store you loved to shop at downtown.",
    answers: [
      { text: "Sears", points: 30 },
      { text: "JC Penney", points: 24 },
      { text: "Woolworths", points: 16 },
      { text: "Belk", points: 12 },
      { text: "Montgomery Ward", points: 10 },
      { text: "Kmart", points: 8 }
    ]
  },
  {
    id: "backinmyday-13",
    category: "Back in My Day",
    text: "Name something every family had in the living room.",
    answers: [
      { text: "Television", points: 28 },
      { text: "Recliner", points: 18 },
      { text: "Radio", points: 14 },
      { text: "Family Photos", points: 12 },
      { text: "Coffee Table", points: 10 },
      { text: "Piano", points: 9 },
      { text: "Doilies", points: 7 }
    ]
  },
  {
    id: "backinmyday-14",
    category: "Back in My Day",
    text: "Name something you used to do by hand that a machine does now.",
    answers: [
      { text: "Wash Clothes", points: 30 },
      { text: "Dry Dishes", points: 22 },
      { text: "Churn Butter", points: 16 },
      { text: "Hang Laundry", points: 14 },
      { text: "Beat the Rugs", points: 10 },
      { text: "Push Mower", points: 6 }
    ]
  },
  {
    id: "backinmyday-15",
    category: "Back in My Day",
    text: "Name something you would always find in a lady's pocketbook.",
    answers: [
      { text: "Handkerchief", points: 28 },
      { text: "Lipstick", points: 24 },
      { text: "Coin Purse", points: 16 },
      { text: "Compact Mirror", points: 12 },
      { text: "Hair Comb", points: 10 },
      { text: "Mints", points: 8 }
    ]
  },

  // ---------------------------------------------------------------
  // Sweet Tooth & Snacks
  // ---------------------------------------------------------------
  {
    id: "sweet-01",
    category: "Sweet Tooth & Snacks",
    text: "Name a candy bar you'd buy at the corner store back in the day.",
    answers: [
      { text: "Snickers", points: 32 },
      { text: "Hershey Bar", points: 24 },
      { text: "Baby Ruth", points: 18 },
      { text: "Milky Way", points: 14 },
      { text: "Almond Joy", points: 8 },
      { text: "Butterfinger", points: 4 }
    ]
  },
  {
    id: "sweet-02",
    category: "Sweet Tooth & Snacks",
    text: "Name a soda you drank straight out of a cold glass bottle.",
    answers: [
      { text: "Coca Cola", points: 32 },
      { text: "Pepsi", points: 24 },
      { text: "Root Beer", points: 16 },
      { text: "RC Cola", points: 12 },
      { text: "Orange Crush", points: 10 },
      { text: "Dr Pepper", points: 6 }
    ]
  },
  {
    id: "sweet-03",
    category: "Sweet Tooth & Snacks",
    text: "Name a dish that always shows up at the church potluck.",
    answers: [
      { text: "Fried Chicken", points: 30 },
      { text: "Deviled Eggs", points: 24 },
      { text: "Potato Salad", points: 16 },
      { text: "Green Beans", points: 12 },
      { text: "Banana Pudding", points: 10 },
      { text: "Corn Bread", points: 8 }
    ]
  },
  {
    id: "sweet-04",
    category: "Sweet Tooth & Snacks",
    text: "Name an ice cream flavor you would order at the parlor.",
    answers: [
      { text: "Vanilla", points: 28 },
      { text: "Chocolate", points: 22 },
      { text: "Strawberry", points: 14 },
      { text: "Butter Pecan", points: 10 },
      { text: "Neapolitan", points: 8 },
      { text: "Peach", points: 7 },
      { text: "Cherry Vanilla", points: 5 },
      { text: "Rocky Road", points: 4 }
    ]
  },
  {
    id: "sweet-05",
    category: "Sweet Tooth & Snacks",
    text: "Name something you would order sitting at the diner counter.",
    answers: [
      { text: "Hamburger", points: 30 },
      { text: "Milkshake", points: 22 },
      { text: "French Fries", points: 16 },
      { text: "Coffee", points: 14 },
      { text: "Grilled Cheese", points: 10 },
      { text: "Apple Pie", points: 8 }
    ]
  },
  {
    id: "sweet-06",
    category: "Sweet Tooth & Snacks",
    text: "Name a penny candy you got at the five and dime.",
    answers: [
      { text: "Tootsie Roll", points: 30 },
      { text: "Jawbreaker", points: 22 },
      { text: "Licorice", points: 16 },
      { text: "Candy Buttons", points: 12 },
      { text: "Wax Lips", points: 10 },
      { text: "Mary Jane", points: 8 }
    ]
  },
  {
    id: "sweet-07",
    category: "Sweet Tooth & Snacks",
    text: "Name a breakfast cereal you begged your mother to buy.",
    answers: [
      { text: "Corn Flakes", points: 26 },
      { text: "Cheerios", points: 20 },
      { text: "Rice Krispies", points: 16 },
      { text: "Frosted Flakes", points: 12 },
      { text: "Wheaties", points: 10 },
      { text: "Raisin Bran", points: 8 },
      { text: "Sugar Pops", points: 6 }
    ]
  },
  {
    id: "sweet-08",
    category: "Sweet Tooth & Snacks",
    text: "Name a dessert your grandmother made from scratch.",
    answers: [
      { text: "Pound Cake", points: 28 },
      { text: "Peach Cobbler", points: 22 },
      { text: "Chocolate Cake", points: 16 },
      { text: "Sugar Cookies", points: 12 },
      { text: "Pecan Pie", points: 10 },
      { text: "Fudge", points: 8 }
    ]
  },
  {
    id: "sweet-09",
    category: "Sweet Tooth & Snacks",
    text: "Name something you would find in a TV dinner tray.",
    answers: [
      { text: "Turkey", points: 34 },
      { text: "Mashed Potatoes", points: 28 },
      { text: "Peas", points: 20 },
      { text: "Gravy", points: 16 }
    ]
  },
  {
    id: "sweet-10",
    category: "Sweet Tooth & Snacks",
    text: "Name a treat you bought at the drive-in snack bar.",
    answers: [
      { text: "Popcorn", points: 32 },
      { text: "Hot Dog", points: 24 },
      { text: "Candy", points: 16 },
      { text: "Soda", points: 12 },
      { text: "Snow Cone", points: 10 },
      { text: "Peanuts", points: 6 }
    ]
  },
  {
    id: "sweet-11",
    category: "Sweet Tooth & Snacks",
    text: "Name a dessert that shows up on the table every Christmas.",
    answers: [
      { text: "Fruitcake", points: 30 },
      { text: "Pumpkin Pie", points: 24 },
      { text: "Coconut Cake", points: 14 },
      { text: "Gingerbread", points: 12 },
      { text: "Divinity", points: 10 },
      { text: "Candy Canes", points: 8 }
    ]
  },
  {
    id: "sweet-12",
    category: "Sweet Tooth & Snacks",
    text: "Name something you put on a hot dog at the ball game.",
    answers: [
      { text: "Mustard", points: 36 },
      { text: "Ketchup", points: 26 },
      { text: "Relish", points: 18 },
      { text: "Onions", points: 12 },
      { text: "Chili", points: 6 }
    ]
  },
  {
    id: "sweet-13",
    category: "Sweet Tooth & Snacks",
    text: "Name a snack waiting for you when you got home from school.",
    answers: [
      { text: "Cookies", points: 30 },
      { text: "Milk", points: 22 },
      { text: "Peanut Butter", points: 16 },
      { text: "Crackers", points: 12 },
      { text: "Fruit", points: 10 },
      { text: "Popsicle", points: 8 }
    ]
  },
  {
    id: "sweet-14",
    category: "Sweet Tooth & Snacks",
    text: "Name a drink you cooled off with on a hot summer day.",
    answers: [
      { text: "Sweet Tea", points: 36 },
      { text: "Lemonade", points: 28 },
      { text: "Kool Aid", points: 18 },
      { text: "Ice Water", points: 10 },
      { text: "Ginger Ale", points: 6 }
    ]
  },
  {
    id: "sweet-15",
    category: "Sweet Tooth & Snacks",
    text: "Name a topping you would ask for on your sundae.",
    answers: [
      { text: "Hot Fudge", points: 32 },
      { text: "Whipped Cream", points: 24 },
      { text: "Cherry", points: 16 },
      { text: "Sprinkles", points: 12 },
      { text: "Caramel", points: 10 },
      { text: "Nuts", points: 6 }
    ]
  }
];

const CATEGORIES = ["Golden Oldies (Music & TV)", "Back in My Day", "Sweet Tooth & Snacks"];
