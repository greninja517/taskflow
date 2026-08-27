# Your workflows go here

This folder is intentionally empty. Create `.yml` files in this directory
(e.g. `ci.yml`, `deploy.yml`) to define your GitHub Actions workflows.

See the main [README.md](../../README.md) for a tiered list of exercises to
work through, from a basic lint-and-test pipeline up to environment-gated
deployments with approval gates.

A minimal starting point, just so you know the shape of a valid file:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Replace me with real lint/test/build jobs"
```

Save that (tweaked) as `ci.yml` if you want a sanity-checked first run, then
start working through the roadmap in the README.
