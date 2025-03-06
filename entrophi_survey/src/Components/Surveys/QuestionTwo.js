const json = {
  "title": "User Registration",
  "description": "Please enter your information to register.",
  "logo": "entrophico_logo.jpg",
  "logoWidth": 60,
  "logoHeight": 60,
  "pages": [  // ✅ Corrected from "questions" to "pages"
      {
          "name": "page1",
          "title": "Page 1",
          "elements": [
              {
                  "type": "rating",
                  "name": "question3",
                  "title": "How active are you?"
              },
              {
                  "type": "text",
                  "name": "question1",
                  "title": "How heavy are you?",
                  "inputType": "number"
              },
              {
                  "type": "text",
                  "name": "question2",
                  "title": "What's your height?"
              },
              {
                  "type": "boolean",
                  "name": "question4",
                  "title": "Do you feel healthy?"
              }
          ]
      }
  ]
};

export default json;
 