# Setup

Repository: [https://github.com/gdias-sword/prototype-playground.git](https://github.com/gdias-sword/prototype-playground.git)

Set up the prototype playground on this computer. Do the work yourself. Ask only when this prompt says to ask. Run commands in the checkout even if this chat started in another folder.

Done means the gallery is open in their browser and this person has a contributor profile. Leave the checkout uncommitted. Write only `.playground` and that person's `app/<username>/profile.json`.

If a step fails, report the command and the error and stop in the checkout. That is the only time you quote a command.

Assume a non-technical user background. Say what you need from the user, then show the gallery.

Do not mention internal tooling (GitHub, Node) or repo-specific config ( `.playground`, `USERNAME`, `.gitignore`) unless necessary. Do not narrate a check that succeeded.

A question should only name a choice they make: where to clone the playground, their profile name, and their team.

The last message is only the checkout path, the local URL, and one instruction: start the next chat from the playground, then ask for a prototype. The gallery is already open. Avoid a recap of what you installed, wrote, or skipped.

## 1. Choose the folder

Propose `<home>/prototype-playground`, where `<home>` is the user home directory. Show the absolute path and wait for user approval.

If that path is already a git checkout of gdias-sword/prototype-playground, resume in it. If the path exists and is not that checkout, stop and ask for a different path.

## 2. Install only what is missing

If `git` works and `node` is >= 20.9.0, use them. 20.9.0 is only the check for what is already installed. Say nothing when they are already fine.

If Git is missing, install it with the normal installer for that system. If Node is missing or older than 20.9.0, install the current Active LTS from https://nodejs.org. Use Homebrew when it is already installed, otherwise the official Node installer. Use npm. This repo has package-lock.json.

If an installer needs an administrator password or a system dialog, stop and say they need to approve it. Continue when they say it is done.

## 3. Sign in and clone

Skip this step when resuming an existing checkout.

If existing git credentials can already fetch this repository, clone with `git clone https://github.com/gdias-sword/prototype-playground.git <absolute-path>`.

Otherwise install the GitHub CLI if it is missing, run `gh auth login`, and stop with one sentence telling them to finish sign-in in the browser and reply when it is done. Then clone with `gh repo clone gdias-sword/prototype-playground <absolute-path>`.

## 4. Install dependencies

From the checkout, run `npm install`.

## 5. Register the person

Read `git config user.name` and leave git config as it is. Do not tell them you read it.

Derive the folder name from the first whitespace-separated word of that name: strip diacritics (ç becomes c), lowercase it, replace any remaining character that is not a–z or 0–9 with a hyphen, collapse repeated hyphens, and trim hyphens. Example: "Gonçalo Dias" becomes `goncalo`.

If the git name is missing, ask what name they want on the gallery and derive the folder from their answer. If the git name is present, ask them to confirm that name as the one shown in the gallery, or give a different one. Do not show the folder name. Do not say where the name came from. In that same question, ask for their team. The only valid teams are `Product Design`, `Product Management`, and `Engineering`. The gallery ignores any other value. Wait for the answer before writing files.

If the folder you are about to use already has a `profile.json` for a different person, stop and ask whether that profile is theirs. Say the name on that profile, not the folder. If `.playground` already sets a different `USERNAME`, stop and ask before replacing it, in terms of the name already on the gallery. If both files already match the confirmed name and folder, leave them.

Otherwise write:

`.playground` at the repo root, one line: `USERNAME=<username>`. It is gitignored. If `.gitignore` is missing that line, add it once.

`app/<username>/profile.json`:

{
"name": "",
"team": ""
}

## 6. Start and open the gallery

Start `npm run dev` and leave it running. Read the local URL the server prints. Request that URL and confirm the gallery responds. A connection error is not done. If the server chooses a port other than 3000, use that URL.

Then open that URL in their browser and leave it there. On macOS run `open <url>`. On Windows run `cmd /c start <url>`. On Linux run `xdg-open <url>`. If the browser does not open, give them the URL and stop.

## 7. Tell them they are ready

The gallery is already open. Send only the absolute checkout path, the local URL, and one line telling them to start the next chat from that folder. They can then ask for a prototype.
