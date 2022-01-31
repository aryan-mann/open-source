# CDN List

Add Javascript and CSS libraries easily through an extensive and editable list of CDN links.

## Features

- Supports over 4000+ CSS and JS libraries
- Automatically parses version number of library from url
- List of libraries loaded in from a simple JSON file
- Can automatically fetch list of libraries from cdnjs
- Either pastes the URL of the library or formats it nicely as the relevant HTML tag (Script, Link, etc.)

## CDNs.json File

The selection of libraries can be personally curated by editing the `CDNs.JSON` file that can be opened using the command: **CDN List: Configure CDNs.json**.  

### File Schema

```json
{
  "Library Name": "https url to the library",
  "Library Name 2": "https url to the library"
}
```

## Known Issues

* No known issues. [Found a bug? Let me know!](mailto:aryan@aryanmann.com)

## Release Notes

### 2.0.0

Added functionality to fetch list of libraries from cdnjs

Simplified schema of `CDNs.json` file

Now supports over 4000+ libraries out of the box

### 1.0.0

Initial release of cdn-list
