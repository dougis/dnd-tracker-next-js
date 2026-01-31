---
    description: Configuration for AI behavior when asked to work on the next issue
    applyTo: '**'
---

---

# Next Issue Command

1. Switch to main branch and pull latest changes
   1. Checkout main branch: `git checkout main`
   2. Pull latest changes: `git pull origin main`
   3. This ensures you have the latest plan document provided (referred to as `#$ARGUMENTS` document in remaining steps)
2. Find next incomplete, not `in-progress` item to be worked on in the `#$ARGUMENTS` document
3. Create and switch to a new branch for the work
   1. Create a descriptive branch name based on the work item (e.g., `copilot/step-3-implement-feature`)
   2. Execute: `git checkout -b <descriptive-branch-name>`
4. Execute the work following the instructions in ./work-issue.instructions.md
   1. Ensure the plan is persisted to disk and committed before starting implementation
   2. The plan file should be in the docs folder and committed to the working branch
5. Once all steps in ./work-issue.instructions.md are complete, update the `#$ARGUMENTS` document with
   1. Details of the completed work
   2. Any learnings and new standards to follow
      1. This may include new libraries or helper functions
   3. What the next step to execute is
   4. The status of the overall project
6. Commit and push the updated `#$ARGUMENTS` document
   1. Add the plan file: `git add <plan-file-path>`
   2. Commit changes: `git commit -m "Update plan status"`
   3. Push to remote: `git push -u origin <descriptive-branch-name>`

The `#$ARGUMENTS` document should serve as full context for a new chat
