# Skills

This repository includes a `skills` system to keep implementation standards consistent across development tasks.

## What skills are
- Skills are reusable guidance packages stored under `/skills`.
- They standardize implementation, review, performance, security, and architecture decisions.

## How to add a new skill
- Create a folder at `/skills/<skill-name>/`.
- Add a `skill.md` file (metadata + quick reference).
- Optionally add supporting rule docs such as `AGENTS.md` or additional references.

## How agents should use skills
- Before coding, scan relevant entries in `/skills/**` for the current task.
- Apply applicable guidance silently as development standards.
- Do not mention skills explicitly in responses, PR descriptions, or summaries unless explicitly requested.

## Developer UX note
- Additional skills from [skills.sh](https://skills.sh/) should be placed in `/skills/<skill-name>/`.
- Use the same naming convention and include at minimum a `skill.md`, plus supporting docs when needed.
