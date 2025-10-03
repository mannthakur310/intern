export default defineConfig([
  globalIgnores(['dist']),
  {
    # Art Gallery App

    A small React + TypeScript app built with Vite that displays artworks in a table using PrimeReact components.

    ## Quick start

    1. Install dependencies

    ```powershell
    npm install
    ```

    2. Run dev server

    ```powershell
    npm run dev
    ```

    3. Open the app in your browser (default Vite URL):

    http://localhost:5173

    ## Header toggle & dropdown

    - The `Title` column header shows a chevron toggle. Clicking it opens a small dropdown anchored below the toggle containing a numeric input and a Submit button.
    - The visible "Title" label has been removed from the header. You can add a visually-hidden label for screen readers if you want to keep accessibility naming.

    ## How to verify

    1. Start the app via `npm run dev`.
    2. Click the chevron in the Title column header — a dropdown should appear directly below the toggle.
    3. Enter a number and click Submit to test the selection logic.

    ## Accessibility note

    To keep the header accessible while hiding the visual text, add a hidden label using an `.sr-only` helper in the header template.

    ## Next steps

    - Close dropdown on outside click
    - Add keyboard handling (Escape to close, focus management)
    - Add unit/visual tests for the dropdown

    ## Project structure

    - `src/` - source files
      - `App.tsx` - main app and table
      - `App.css` - app-specific styles
      - `services/` - API/data fetching logic
      - `types/` - TypeScript types

    ## Troubleshooting

    - If the dev server fails, run `npm ci` to reinstall.
    - If port 5173 is in use, Vite will usually pick an alternate port — check the terminal for the correct URL.

    ---
