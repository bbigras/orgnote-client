#!/bin/bash

yarn build:all
mkdir ./dist/build
java -jar bundletool.jar build-apks --bundle=./dist/cordova/android/bundle/release/app-release.aab --output=./dist/pwa/builds/second-brain.apks
