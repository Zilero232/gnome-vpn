import type { ScenePosterProps } from './ScenePoster.types';

import { GnomeArt, GroundArt, HillsArt, SCENE_VIEWBOX, SkyArt } from '../SceneArt';

export const ScenePoster = ({ className, width, height }: ScenePosterProps) => (
  <svg
    aria-hidden
    className={className}
    height={height}
    preserveAspectRatio='xMidYMid slice'
    viewBox={SCENE_VIEWBOX}
    width={width}
    xmlns='http://www.w3.org/2000/svg'
  >
    {SkyArt()}
    {HillsArt()}
    {GnomeArt()}
    {GroundArt()}
  </svg>
);
