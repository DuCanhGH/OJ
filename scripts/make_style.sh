#!/bin/bash
# Move to repo's root
cd "$(dirname "$0")/.." || exit

build_style() {
  echo "Creating $1 style..."
  cp resources/vars-$1.scss resources/vars.scss
  npx sass resources:sass_processed
  npx postcss sass_processed/style.css sass_processed/martor-description.css sass_processed/select2-dmoj.css --verbose --use autoprefixer -d $2
}

build_style 'default' 'resources'
build_style 'dark' 'resources/dark'
