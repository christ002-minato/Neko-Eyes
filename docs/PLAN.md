# Plan: Fix Earth's Solar Rotation

## Problem
The `calculateInitialEarthRotationAngle` computes a static initial angle at epoch. As Earth orbits, the subsolar point drifts from the correct meridian (0° = Africa/West Africa).

## Approach
In `App.tsx` `useFrame`, add a dynamic calculation that updates the rotation based on the current orbital position of Earth, ensuring 12:00 UTC aligns with the subsolar point at the correct longitude.
