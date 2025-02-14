publish a new version:

1. update version number in package.json
2. create a git tag and push it 
git tag raouf-test-package@0.0.2 && git push origin raouf-test-package@0.0.2
git tag easya-sdk-core@0.0.1 && git push origin easya-sdk-core@0.0.1
git tag easya-react@0.0.1 && git push origin easya-react@0.0.1


remove a tag

git tag -d raouf-test-package@0.0.1 && git push origin --delete tag raouf-test-package@0.0.1
git tag -d easya-sdk-core@0.0.1 && git push origin --delete tag easya-sdk-core@0.0.1
git tag -d easya-react@0.0.1 && git push origin --delete tag easya-react@0.0.1



## Or use
node publish.js easya-sdk-core 0.0.0

node publish.js easya-react 0.0.0



