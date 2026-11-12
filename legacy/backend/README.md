# Legacy backend (archived)

The original 2024 Flask API for Smithenes. It received form data, computed each
model with numpy, rendered the graph with matplotlib, and returned it as a
base64 PNG. The frontend was hosted on Netlify and this API on PythonAnywhere.

It is kept here for reference and history only and is no longer deployed. Its
economics logic is being reimplemented in TypeScript in the browser, with unit
tests, so graphs can update in real time while curves are dragged.

The full commit history from the former `econlab-backend` repository is
preserved, for example:

```sh
git log --follow legacy/backend/controller.py
```
