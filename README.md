# po-translate

Motivations:
- Implement cache to avoid hitting google translate api rate limit

## Run

`po-translate <file> --language <language> --cache <cache-file> --output <output-file>`

### Language

See [Google Developer's Language Code](https://developers.google.com/admin-sdk/directory/v1/languages)

## Future

### Multi-language support

Currently words are assumed to be translated from English. More languages should be supported

### Cache Format

CSV on top of json can be used as cache format for easy editing