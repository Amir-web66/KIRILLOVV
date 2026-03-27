# Amir Khammar Portfolio

Dark blue and black portfolio site with a Rinnegan-inspired visual style.

## Folder Architecture

- index.html
- styles.css
- script.js
- firebase.json
- .firebaserc
- assets/
  - certs/
  - img/
  - projects/

## Run Locally

You can open `index.html` directly, or use a local server.

## Deploy Option 1: GitHub Pages

1. Push this folder to your GitHub repository root (or `docs/` folder).
2. Go to repository settings > Pages.
3. Select source branch (`main`) and folder (`/root` or `/docs`).
4. Save and wait for GitHub Pages build.

## Deploy Option 2: Firebase Hosting

1. Install Firebase CLI:
   - `npm install -g firebase-tools`
2. Login:
   - `firebase login`
3. `.firebaserc` is already set to `kirillov-wrld-portfolio`.
   - If your Firebase project id is different, update `.firebaserc`.
4. Deploy:
   - `firebase deploy`

## How To Add A New Certificate

1. Add your certificate image to `assets/certs/` (PNG/JPG).
2. Open `assets/certs/certificates.json`.
3. Add a new object in the array:

```json
{
  "title": "My New Certificate",
  "description": "Optional short note",
  "image": "assets/certs/my-certificate.png"
}
```

4. Save and redeploy (GitHub Pages or Firebase).

If you do not have an image yet, keep only `title` (and optional `description`).

## Add Button (+) In Website

The site now has a floating `+` button at bottom-right.

Use it to add:
- `Type`: `Certification` or `Project`
- `Title`
- `Description`
- `Stack/Tags` (for projects)
- `Link URL` and `Link Label`
- `Image URL` or local image file

Behavior:
- Without Firebase config: saved only in your browser (localStorage).
- With Firebase config: saved online to Firestore collection `portfolioEntries`.

## Firebase Setup For Add Button

1. Create Firebase project (`kirillov-wrld-portfolio` or your own id).
2. Enable Firestore Database in test mode.
3. In `script.js`, fill `FIREBASE_CONFIG` with your real values:

```js
const FIREBASE_CONFIG = {
   apiKey: "...",
   authDomain: "...",
   projectId: "...",
   appId: "..."
};
```

4. Deploy again.

Firestore rules for testing:

```txt
rules_version = '2';
service cloud.firestore {
   match /databases/{database}/documents {
      match /{document=**} {
         allow read, write: if true;
      }
   }
}
```

For production, restrict rules to authenticated users.

## Important

- `firebase.json` configures only hosting/deploy behavior.
- This portfolio is static; certificate data is managed in `assets/certs/certificates.json`.

## Notes

- Add your real HackTheBox and HackViser profile links in `index.html`.
- If your LinkedIn URL differs, update it in `index.html`.
