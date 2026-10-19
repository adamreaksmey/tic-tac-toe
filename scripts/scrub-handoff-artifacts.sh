#!/bin/sh
set -eu
found=0
for path in candidates.json plans/invoker-handoff.md plans/invoker-handoff.yaml
do
  if [ -e "$path" ]
  then
    echo "handoff artifact present: $path" >&2
    found=1
  fi
done
for path in research-*.json lens-*.json
do
  if [ -e "$path" ]
  then
    echo "handoff artifact present: $path" >&2
    found=1
  fi
done
exit "$found"
