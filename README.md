## Orcasound Next

<<<<<<< HEAD
React prototype: [https://next.orcasound.net/beta](https://next.orcasound.net/beta)

UX case study: [https://www.adriandesigns.webflow.io/orcasound-listening-experience](https://www.adriandesigns.webflow.io/orcasound-listening-experience)
=======
React prototype: [https://next.orcasound.net](https://next.orcasound.net)

UX case study: [https://adriandesigns.webflow.io/orcasound-listening-experience](https://adriandesigns.webflow.io/orcasound-listening-experience)
>>>>>>> upstream/main

___

![After - candidate screens](https://github.com/user-attachments/assets/d8cf3850-785d-453e-bea3-cf2d97df6e6a)


### Design Goals
We set out to:
- Make past detections and user reports more discoverable.
- Provide a more interactive experience that helps users explore and analyze orca sounds.
- Start integrating AI detections to support learning and research.
- Build a foundation for richer conservation tools and community feedback.


The redesigned prototype introduces:

- A searchable, filterable list of historical recordings based on user reports and AI detections.
- Integrated spectrogram viewer and audio player for quick review and annotation.
- Previewable detection markers tied to audio segments for easier analysis.
- A responsive layout optimized for both desktop and mobile use.

---

### Built With

This prototype was built in React using:
- **Next.js** for app structure and routing
- **Material UI** for the component system
- **React Query** for data fetching and caching
- **Video.js** for advanced audio playback
- **GraphQL** to fetch detection and hydrophone metadata

This is an experimental prototype used for testing ideas and generating feedback. The design is open source and still evolving. Contributions and collaborations welcome!

### Local Devcontainer Ports

This prototype intentionally uses different host ports than `orcasite` so both repos can run side by side.

- UI: `http://localhost:3001` (container `3000`)
- Server/API: `http://localhost:4001` (container `4000`)
- Postgres: `localhost:5434` (container `5432`)
- Redis: `localhost:6380` (container `6379`)

The defaults are configured in `docker-compose.yml` for this repo's devcontainer workflow.
You can override them with environment variables: `WEB_HOST_PORT`, `SERVER_HOST_PORT`, `DB_HOST_PORT`, and `CACHE_HOST_PORT`.
