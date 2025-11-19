import { PreloadedAsset } from "./Asset"

export type SoundAssetSet = {
  click: PreloadedAsset,
  hover: PreloadedAsset,
  alert: PreloadedAsset
}

export type SoundAudioSet = {
  click: HTMLAudioElement,
  hover: HTMLAudioElement,
  alert: HTMLAudioElement
}

export enum Sound {
  Click,
  Hover,
  Alert
}

export const uiSoundSet: SoundAssetSet = {
  click: new PreloadedAsset("/assets/click.mp3"),
  hover: new PreloadedAsset("/assets/hover.mp3"),
  alert: new PreloadedAsset("/assets/alert.mp3"),
}

export const uiAudioSet: () => SoundAudioSet = () => ({
  click: new Audio(uiSoundSet.click.loadedUrl),
  hover: new Audio(uiSoundSet.hover.loadedUrl),
  alert: new Audio(uiSoundSet.alert.loadedUrl),
})

export const playSound = async (s: Sound) => {
  const { Click, Hover, Alert } = Sound;

  switch (s) {
    case Click:
      await uiAudioSet().click.play()
      break
    case Hover:
      await uiAudioSet().hover.play()
      break
    case Alert:
      await uiAudioSet().alert.play()
      break
  }
}

const clickSoundElements: NodeListOf<HTMLElement> = document.querySelectorAll("[data-click-sound]")
const hoverSoundElements: NodeListOf<HTMLElement> = document.querySelectorAll("[data-hover-sound]")
const alertSoundElements: NodeListOf<HTMLDialogElement> = document.querySelectorAll("[data-alert-sound]")

for (const el of clickSoundElements) {
  el.addEventListener("mousedown", async e => {
    const target = e.target;

    if (!(target instanceof HTMLElement)) {
      return
    }

    playSound(Sound.Click)
  })
}

for (const el of hoverSoundElements) {
  el.addEventListener("mouseenter", async e => {
    // If the element that got hovered over is a descendant of el, ignore it
    if (e.target !== e.currentTarget) return

    playSound(Sound.Hover)
  })

  el.addEventListener("focusin", async e => {
    // If the element that got hovered over is a descendant of el, ignore it
    if (e.target !== e.currentTarget) return

    playSound(Sound.Hover)
  })
}

for (const el of alertSoundElements) {
  el.addEventListener("toggle", async () => {
    if (el.open) {
      playSound(Sound.Alert)
    }
  })
}
