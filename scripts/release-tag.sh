#!/bin/bash
set -e

# Receive the app name and update type as arguments
app="$1"
update_type="$2"
stg="$3"

# Check if the current branch is "main"
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ] && [ "$stg" != "stg" ]; then
  echo "Error: This script can only be run on the 'main' branch or with 'stg' as the third argument."
  exit 1
fi

prefixTag="${app}-"
if [ "$stg" = "stg" ]; then
  prefixTag="stg-${app}-"
fi

# Retrieve the last tag for the app
last_tag=$(git describe --tags --match "${prefixTag}*" --abbrev=0)

# Calculate the new version
current_version=$(echo "${last_tag}" | sed -e "s/^${prefixTag}v//")
IFS='.' read -r -a version_parts <<< "$current_version"
major=${version_parts[0]}
minor=${version_parts[1]}
patch=${version_parts[2]}
case $update_type in
  major)
    major=$((major + 1))
    minor=0
    patch=0
    ;;
  minor)
    minor=$((minor + 1))
    patch=0
    ;;
  patch)
    patch=$((patch + 1))
    ;;
  *)
    echo "Invalid update type argument. Please provide a valid update type: major | minor | patch"
    exit 1
    ;;
esac
new_version="${major}.${minor}.${patch}"


# Check if there are changes in the app
if git diff --name-only ${last_tag}..HEAD | grep -q -e "apps/${app}" ; then

  # Retrieve the commit history since the last tag
  commit_history=$(git log ${last_tag}..HEAD --pretty=format:"- %s" -- apps/${app})

  # Create a new tag with the app name and the commit message
  new_tag="${prefixTag}v${new_version}"
  new_tag_message=$(cat <<EOF
${new_tag} Release Notes

Changes
${commit_history}
EOF
)

  # Create the new tag
  git tag -a "${new_tag}" -m "${new_tag_message}"

  echo "New tag ${new_tag} has been created with the commit history for apps/${app} since ${last_tag}."
  echo "${new_tag_message}"
else
  echo "No changes in apps/${app} since the last ${app} tag. No new tag created."
fi
