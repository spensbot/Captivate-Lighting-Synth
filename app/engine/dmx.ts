const DMX_MAX_VALUE = 255;
const DMX_NUM_CHANNELS = 512;
const DMX_DEFAULT_VALUE = 0;

type DmxChannel = number // 1 - 512
type DmxValue = number // 0 - 255
type Normalized = number // 0.0 - 1.0

enum ChannelType {
  Color,
  Master,
  StrobeSpeed,
  Other,
}

enum Color {
  Red,
  Green,
  Blue,
  White,
  Black,
}

type ChannelMaster = {
  type: ChannelType.Master
}

type ChannelColor = {
  type: ChannelType.Color
  color: Color
}

type ChannelStrobe = {
  type: ChannelType.StrobeSpeed
  default_strobe: DmxValue
  default_solid: DmxValue
}

type ChannelOther = {
  type: ChannelType.Other
  default: DmxValue
}

type FixtureChannel = ChannelMaster | ChannelColor | ChannelStrobe | ChannelOther

type FixtureType = {
  manufacturer?: String
  name?: String
  channels: FixtureChannel[]
}

const parFixture : FixtureType = {
  manufacturer: "Laluce Natz",
  name: "Par",
  channels: [
    { type: ChannelType.Master },
    { type: ChannelType.Color, color: Color.Red },
    { type: ChannelType.Color, color: Color.Green },
    { type: ChannelType.Color, color: Color.Blue },
    { type: ChannelType.Color, color: Color.White },
    { type: ChannelType.StrobeSpeed, default_solid: 0, default_strobe: 125 },
    { type: ChannelType.Other, default: 0 },
    { type: ChannelType.Other, default: 0 },
  ]
}

const stringLightFixture : FixtureType = {
  channels: [
    { type: ChannelType.Master },
  ]
}

const strobeFixture : FixtureType = {
  channels: [
    { type: ChannelType.Master },
    { type: ChannelType.StrobeSpeed, default_solid: 0, default_strobe: 251 },
    { type: ChannelType.Other, default: 0 },
  ]
}

const derbyFixture : FixtureType = {
  channels: [
    { type: ChannelType.Master },
    { type: ChannelType.Color, color: Color.Red },
    { type: ChannelType.Color, color: Color.Green },
    { type: ChannelType.Color, color: Color.Blue },
    { type: ChannelType.StrobeSpeed, default_solid: 0, default_strobe: 251 },
    { type: ChannelType.Other, default: 0 },
    { type: ChannelType.Other, default: 0 },
  ]
}

type Window = {
  pos: Normalized
  width: Normalized
}

type Window2D = {
  x?: Window
  y?: Window
}

type FixturePosition = {
  x?: Window
  y?: Window
}

type Fixture = {
  channelNum: DmxChannel,
  type: FixtureType,
  position?: FixturePosition
}

const fixturesTest : Fixture[] = [
  {channelNum: 1, type: stringLightFixture, position: {x: {pos: 0.0, width: 0.0}} },
  {channelNum: 2, type: stringLightFixture, position: {x: {pos: 0.33, width: 0.0}} },
  {channelNum: 3, type: stringLightFixture, position: {x: {pos: 0.66, width: 0.0}} },
  {channelNum: 4, type: stringLightFixture, position: {x: {pos: 1.0, width: 0.0}} },
  {channelNum: 5, type: parFixture },
  {channelNum: 12, type: parFixture },
  {channelNum: 19, type: strobeFixture },
  {channelNum: 22, type: derbyFixture },
]

enum Param {
  Hue = "Hue",
  Saturation = "Saturation",
  Brightness = "Brightness",
  Black = "Black",
  X = "X",
  Y = "Y",
  X_Width = "X_Width",
  Y_Width = "Y_Width",
  Epicness = "Epicness",
  Strobe = "Strobe",
}

type Params = {
  [Param.Hue]: Normalized
  [Param.Saturation]: Normalized
  [Param.Brightness]: Normalized
  [Param.Black]: Normalized
  [Param.X]: Normalized
  [Param.X_Width]: Normalized
  [Param.Y]: Normalized
  [Param.Y_Width]: Normalized
  [Param.Epicness]: Normalized
  [Param.Strobe]: "Strobe" | "No Strobe"
}

type Colors = {
  [Color.Red]: Normalized,
  [Color.Green]: Normalized,
  [Color.Blue]: Normalized,
  [Color.White]: Normalized,
  [Color.Black]: Normalized
}

enum LfoShape {
  Sin,
  Square,
  Saw,
  Constant
}

type Oscillator = {
  shape: LfoShape
  period: number // Beats
  value: Normalized
}

type Range = {
  min: Normalized,
  max: Normalized
}

type Pattern = {
  oscillators: Oscillator[],
  epicnessRange?: Range,
}

const Patterns: Pattern[] = [

]

function getWindowMultiplier2D(fixturePosition?: Window2D, movingWindow?: Window2D) {
  if (fixturePosition && movingWindow) {
    return getWindowMultiplier(fixturePosition.x, movingWindow.x) * getWindowMultiplier(fixturePosition.y, movingWindow.y)
  }
  return 1.0 // Don't affect light values if the moving window or fixture position haven't been assigned.
}

function getWindowMultiplier(fixturePosition?: Window, movingWindow?: Window) {
  if (fixturePosition && movingWindow) {
    const distanceBetween = Math.abs(fixturePosition.pos - movingWindow.pos)
    const reach = fixturePosition.width / 2 + movingWindow.width / 2

    return distanceBetween > reach ? 0.0 : 1.0 - distanceBetween / reach;
  }
  return 1.0 // Don't affect light values if the moving window or fixture position haven't been assigned.
}

function getDmxValue(fixtureChannel: FixtureChannel, params: Params, colors: Colors, fixturePosition?: FixturePosition, movingWindow?: Window2D): DmxValue {
  switch (fixtureChannel.type) {
    case ChannelType.Master:
      return params.Brightness * DMX_MAX_VALUE * getWindowMultiplier2D(fixturePosition, movingWindow);
    case ChannelType.Other:
      return fixtureChannel.default;
    case ChannelType.Color:
      return colors[fixtureChannel.color]
    case ChannelType.StrobeSpeed:
      return params.Strobe == "Strobe" ? fixtureChannel.default_strobe : fixtureChannel.default_solid
  }
}

type Blackout = "Blackout" | "No Blackout"

// https://en.wikipedia.org/wiki/HSL_and_HSV
function hsl2rgb(h: Normalized, s: Normalized, l: Normalized) {
  const C = (1 - Math.abs(2*l - 1)) * s
  const hp = h * 6
  const X = C * (1- Math.abs(hp % 2 - 1) )

  const [r1, g1 , b1] = (() => {
    if (hp < 1) {
      return [C, X, 0]
    } else if (hp < 2) {
      return [X, C, 0]
    } else if (hp < 3) {
      return [0, C, X]
    } else if (hp < 4) {
      return [0, X, C]
    } else if (hp < 5) {
      return [X, 0, C]
    } else {
      return [C, 0, X]
    }
  })()

  const m = l - C/2

  return [r1 + m, g1 + m, b1 + m]
}

function getColors(params: Params): Colors {
  const [r, g, b] = hsl2rgb(params.Hue, params.Saturation, params.Brightness)

  return {
    [Color.Red]: r,
    [Color.Green]: g,
    [Color.Blue]: b,
    [Color.Black]: params.Black,
    [Color.White]: params.Brightness
  }
}

function getMovingWindow(params: Params): Window2D {
  return {
    x: {pos: params.X, width: params.X_Width},
    y: {pos: params.Y, width: params.Y_Width}
  }
}

export default function getDMX(blackout: Blackout, params: Params, fixtures: Fixture[]): DmxValue[] {
  const dmxSend = new Array(DMX_NUM_CHANNELS).fill(DMX_DEFAULT_VALUE);

  if (blackout) return dmxSend

  const colors = getColors(params);
  const movingWindow = getMovingWindow(params);

  fixtures.forEach(fixture => {
    fixture.type.channels.forEach( (channel, offset) => {
      dmxSend[fixture.channelNum + offset] = getDmxValue(channel, params, colors, fixture.position, movingWindow)
    })
  })

  return dmxSend
}
