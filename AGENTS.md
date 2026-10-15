<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep consultation demo fixtures in a browser-safe data module; examples must remain separate from real patient records.
- Keep the user-supplied unit directory and fictional specialty/capacity fixtures in a browser-safe data module, with explicit provenance; directory contacts are not official verified records.
- Use one pure queue-ordering function for consultation fixtures: clinical urgency first, then arrival within each group, so new urgent arrivals never overtake existing urgent arrivals.
- Keep the directory in a focused filterable, paginated component and initially show only key specialties, so catalog growth does not flood the home screen.
