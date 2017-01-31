const videos = { video1: 'video/demovideo1', video2: 'video/demovideo2' }
let effectFunction = null

function getFormatExtension() {
  let video = document.getElementById('video')
  if (video.canPlayType("video/mp4")) {
    return ".mp4";
  }else if (video.canPlayType("video/webm")) {
    return ".webm";
  }else if (video.canPlayType("video/ogg")) {
    return ".ogv";
  }
}

window.onload = () => {
  let video = document.getElementById('video')
  video.src = videos.video1 + getFormatExtension()
  video.load()

  const controlLinks = document.querySelectorAll('a.control')
  controlLinks.forEach(link => {
    link.onclick = handleControl
  })

  const effectLinks = document.querySelectorAll('a.effect');
  effectLinks.forEach( link => {
    link.onclick = setEffect
  })

  const videoLinks = document.querySelectorAll('a.videoSelection')
  videoLinks.forEach( link => {
    link.onclick = setVideo
  })

  pushUnpushButtons('video1', [])
  pushUnpushButtons('normal', [])

  video.addEventListener('ended', endedHandler, false)
  video.addEventListener('play', processFrame, false)
}

function handleControl(event) {
  const id = event.target.getAttribute('id')
  let video = document.getElementById('video')

  if (id === 'play') {
    pushUnpushButtons('play', ['pause'])
    if (video.ended) {
      video.load()
    }
    video.play()
  } else if (id === 'pause') {
    pushUnpushButtons('pause', ['play'])
    video.pause()
  } else if (id === 'loop') {
    if (isButtonPushed('loop')) {
      pushUnpushButtons('', ['loop'])
    } else {
      pushUnpushButtons('loop', [])
    }
    video.loop = !video.loop
  } else if (id === 'mute') {
    if (isButtonPushed('mute')) {
      pushUnpushButtons('', ['mute'])
    } else {
      pushUnpushButtons('mute', [])
    }
    video.muted = !video.muted
  }
}

function setEffect(event) {
  const id = event.target.getAttribute('id')

  if (id === 'normal') {
    pushUnpushButtons('normal', ['western', 'noir', 'scifi'])
    effectFunction = null
  } else if (id === 'western') {
    pushUnpushButtons('western', ['normal', 'noir', 'scifi'])
    effectFunction = western
  } else if (id === 'noir') {
    pushUnpushButtons('noir', ['normal', 'western', 'scifi'])
    effectFunction = noir
  } else if (id === 'scifi') {
    pushUnpushButtons('scifi', ['normal', 'western', 'noir'])
    effectFunction = scifi
    }
}

function setVideo(event) {
  const id = event.target.getAttribute('id')
  const video = document.getElementById('video')

  if (id === 'video1') {
    pushUnpushButtons('video1', ['video2'])
  } else if (id === 'video2') {
    pushUnpushButtons('video2', ['video1'])
  }
  video.src = videos[id] + getFormatExtension()
  video.load()
  video.play()

  pushUnpushButtons('play', ['pause'])
}

function pushUnpushButtons(idToPush, idArrayToUnpush) {
  let anchor,
      theClass;
  if (idToPush != '') {
    anchor = document.getElementById(idToPush)
    theClass = anchor.getAttribute('class')

    if (!theClass.indexOf('selected') >= 0) {
      theClass = theClass + ' selected'
      anchor.setAttribute('class', theClass)
      let newimage = `url(images/${idToPush}pressed.png`
      anchor.style.backgroundImage = newimage
    }
  }

  idArrayToUnpush.forEach(id => {
    anchor = document.getElementById(id)
    theClass = anchor.getAttribute('class')
    if (theClass.indexOf('selected') >= 0) {
      theClass = theClass.replace('selected', '')
      anchor.setAttribute('class', theClass)
      anchor.style.backgroundImage = ''
    }
  })
}

function isButtonPushed(id) {
  let anchor = document.getElementById(id)
  let theClass = anchor.getAttribute('class')
  return (theClass.indexOf('selected') >= 0)
}

function endedHandler() {
  pushUnpushButtons('', ['play'])
}

function processFrame() {
  const video = document.getElementById('video')
  if (video.paused || video.ended) {
    return
  }

  const bufferCanvas = document.getElementById('buffer')
  const displayCanvas = document.getElementById('display')
  const buffer = bufferCanvas.getContext('2d')
  const display = displayCanvas.getContext('2d')

  buffer.drawImage(video, 0, 0, bufferCanvas.width, bufferCanvas.height)
  const frame = buffer.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height)

  // to know how many pixels we have to loop through in the frame data array we need to
  // divide the length of the array by 4 because 1 pixel occupies 4 spaces
  // in the array(rgba)
  var pixelCount = frame.data.length / 4

  for (let i = 0; i <pixelCount; i++) {
    let r = frame.data[i * 4 + 0]
    let g = frame.data[i * 4 + 1]
    let b = frame.data[i * 4 + 2]
    if (effectFunction) {
      effectFunction(i, r, g, b, frame.data)
    }
  }
  display.putImageData(frame, 0, 0)
  setTimeout(processFrame, 0)
}

function noir(pos, r, g, b, data) {
  let brightness = (3 * r + 4 * g + b) >>> 3
  if (brightness < 0) brightness = 0
    data[pos * 4 + 0] = brightness
    data[pos * 4 + 1] = brightness
    data[pos * 4 + 2] = brightness
}

function western(pos, r, g, b, data) {
  let brightness = (3 * r + 4 * g + b) >>> 3
  data[pos * 4 + 0] = brightness + 40
  data[pos * 4 + 1] = brightness + 20
  data[pos * 4 + 2] = brightness - 20
}

function scifi(pos, r, g, b, data) {
  let offset = pos * 4
  data[offset] = Math.round(255 - r)
  data[offset + 1] = Math.round(255 - g)
  data[offset + 2] = Math.round(255 - b)
}

function bwcartoon(pos, r, g, b, outputData) {
  let offset = pos * 4
  if (outputData[offset] < 120) {
    outputData[++offset] = 80
    outputData[++offset] = 80
    outputData[++offset] = 80
  } else {
    outputData[++offset] = 255
    outputData[++offset] = 255
    outputData[++offset] = 255
  }
  outputData[++offset] = 255
  ++offset
}
