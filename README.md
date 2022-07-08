# stackpath-cdn-purge

Heavily inspired by [GrandPoohBears](https://github.com/GrandPoohBear/stackpath-cdn-purge-action) stackpath cdn purge, I needed a way to be able to pass a list of files to purge from Stackpath. Since purging the entire directory was not an option for my use case, I decided to make this so that you could pass an array of URLs to the action to purge them.

### Usage
```
name: Purge CDN
uses: johncburnette/stackpath-cdn-purge@v1
with:
  clientId: ${{ secrets.STACKPATH_CLIENT_ID }}
  clientSecret: ${{ secrets.STACKPATH_CLIENT_SECRET }}
  stackId: stack-id-here
  urls: |
    https://www.example.com/file.js
    https://www.example.come/file2.js
```


