# fondazzjonitaklula.mt

Static site (HTML, CSS, JavaScript), deployed by Cloudflare Pages from this repository.

## Updating content

Most updates only need one of these three files, edited directly on GitHub:

- `events.json`: upcoming events. Past dates disappear from the site automatically.
  - `poster`: path to the poster image (upload it to `images/` first). Leave as "" for a generated card.
  - `register`: Google Form link. Set `"registration_closed": true` to show "Reġistrazzjonijiet Magħluqa" instead.
  - `partners`: optional logos strip, `{ "img": "images/....png", "alt": "names" }`.
- `activities.json`: the "Matul is-sena" cards on the homepage. Add `"status": "planned"` to an activity to show a "New" tag.
- `past-events.json`: the photo galleries. `photos` lists the files inside `folder`; the first one is the cover.

## Structure

- `index.html`, `about.html`, `events.html`, `contact.html`: pages
- `css/klula.css`: all styles
- `js/klula.js`: events, activities, galleries, event panel, contact form
- `images/`: all images

Event details can be linked directly, e.g. `events.html#evt-004`.
