# Third-party data

`src/word-db.js` bundles a cleaned, bidirectional word-association lookup
built from the [word.associations](https://github.com/monolithpl/word.associations)
project (MIT License, Copyright 2016 Wiktor Jakubczyc), which combines data
from:

- Edinburgh Associative Thesaurus (EAT)
- University of South Florida Free Association Norms (USF-FAN)
- wordassociation.org

It is used to let Focus Topic mode recognize when a video is on-topic even
if it never uses the exact word the user typed (e.g. a "medicine" topic
recognizing a video about "doctors" or "hospitals").
