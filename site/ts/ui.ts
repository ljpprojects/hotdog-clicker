export const beginLoading = () => {
  document.body.setAttribute("data-progress", "true")
}

export const endLoading = () => {
  document.body.removeAttribute("data-progress")
}
