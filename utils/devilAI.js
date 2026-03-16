// Devil AI - Auto Response Logic
const devilResponses = {
    "hello": "Hey baby, Devil is here to make things hot! 🔥",
    "hey devil": "Yes naughty? Kuch khaas kaam hai ya sirf maze lene aaye ho? 😉",
    "kaise ho": "Main toh hamesha 'Hot' rehta hoon, tum apni batao... ❤️",
    "single": "Devil hamesha single rehta hai taaki sabka ho sake! 😈",
    "sexy": "Shhh... yahan sab sexy hi hain, bas nazar chahiye dekhne wali.",
    "rules": "Yahan ka ek hi rule hai: No rules! Bas enjoy karo aur anonymous raho. 🌷"
};

const getAIResponse = (userText) => {
    const input = userText.toLowerCase();
    
    // Check for specific keywords
    for (let key in devilResponses) {
        if (input.includes(key)) {
            return devilResponses[key];
        }
    }
    
    // Default response agar kuch samajh na aaye
    return "Main sun raha hoon... thoda aur detail mein batao kya chahiye? 😏";
};

module.exports = { getAIResponse };

