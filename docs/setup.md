# Set up the playground

Set up the Sword prototype playground on this computer. Do the work yourself. Ask only when this prompt says to ask. Run commands in the checkout even if this chat started in another folder.

Done means the local gallery is running and this person has a contributor profile. Leave the checkout uncommitted. Write only `.playground` and that person's `app/<username>/profile.json`.

If a step fails, report the command and the error and stop in the checkout.

Repository: https://github.com/gdias-sword/prototype-playground.git

## 1. Choose the folder

Propose `<home>/prototype-playground`, where `<home>` is the person's home directory. Show the absolute path and wait for them to accept it or give a different path.

If that path is already a git checkout of gdias-sword/prototype-playground, resume in it. If the path exists and is not that checkout, stop and ask for a different path.

## 2. Install only what is missing

If `git` works and `node` is >= 20.9.0, use them. 20.9.0 is only the check for what is already installed.

If Git is missing, install it with the normal installer for that system. If Node is missing or older than 20.9.0, install the current Active LTS from https://nodejs.org. Use Homebrew when it is already installed, otherwise the official Node installer. Use npm. This repo has package-lock.json.

If an installer needs an administrator password or a system dialog, stop and say so. Continue when they say it is done.

## 3. Sign in and clone

Skip this step when resuming an existing checkout.

If existing git credentials can already fetch this repository, clone with `git clone https://github.com/gdias-sword/prototype-playground.git <absolute-path>`.

Otherwise install the GitHub CLI if it is missing, run `gh auth login`, and stop with one sentence telling them to finish sign-in in the browser and reply when it is done. Then clone with `gh repo clone gdias-sword/prototype-playground <absolute-path>`.

## 4. Install dependencies

From the checkout, run `npm install`.

## 5. Register the person

Read `git config user.name` and leave git config as it is.

Derive the folder name from the first whitespace-separated word of that name: strip diacritics (ç becomes c), lowercase it, replace any remaining character that is not a–z or 0–9 with a hyphen, collapse repeated hyphens, and trim hyphens. Example: "Gonçalo Dias" becomes `goncalo`.

If the git name is missing, ask for the display name and derive the folder from their answer. If the git name is present, show the display name and the folder name and ask them to confirm or correct both. In that same question, ask for their team. The only valid teams are `Product Design`, `Product Management`, and `Engineering`. The gallery ignores any other value. Wait for the answer before writing files.

If `app/<username>/profile.json` already exists for a different person, stop and ask. If `.playground` already sets a different `USERNAME`, stop and ask before replacing it. If both files already match the confirmed name and folder, leave them.

Otherwise write:

`.playground` at the repo root, one line: `USERNAME=<username>`. It is gitignored. If `.gitignore` is missing that line, add it once.

`app/<username>/profile.json`:

{
"name": "",
"team": ""
}

## 6. Start and verify

Start `npm run dev` and leave it running. Read the local URL the server prints. Request that URL and confirm the gallery responds. A connection error is not done. If the server chooses a port other than 3000, verify and report that URL.

## 7. Tell them they are ready

Send the absolute checkout path, the local URL, and one line telling them to start the next chat from that folder. They can then ask for a prototype.
