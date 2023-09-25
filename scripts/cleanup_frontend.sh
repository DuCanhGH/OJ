# Move to repo's root
cd "$(dirname "$0")/.." || exit

source_dir="$(pwd)/bundled"
target_dir="$(pwd)/templates"

# Move bundled/[...path]/file.html to templates/[...path]/file.html
find $source_dir -wholename '**/*.html' -print0 | while read -d $'\0' html_file
do
    relative_path=${html_file##"$source_dir"}

    target_path="$target_dir$relative_path"

    # Ensure the target directory exists
    mkdir -p "$(dirname "$target_path")"

    # Move the HTML file to the target directory
    mv "$html_file" "$target_path"

    echo "Moved $html_file to $target_path"
done