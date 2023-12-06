import queryString from 'query-string'
import { Config, Orientation } from './types/config'

export class XYFinaceWidget {
  private static iframeId = 'xy-finance-iframe'
  private static rootId = 'xy-finance-widget-root'
  private static placeholderId = 'xy-finance-placeholder'

  private static sizes = {
    portrait: {
      height: 700,
      width: 480
    },
    landscape: {
      height: 439,
      width: 832
    }
  }

  private orientation: Orientation

  private isWidgetIntoViewport: boolean

  private resizeObserver: ResizeObserver

  private static breakpoint = 768
  private config: Config = {
    fromTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    sourceChainId: '1',
    toTokenAddress: '0x77777777772cf0455fB38eE0e75f38034dFa50DE',
    targetChainId: '1',
    amount: 1,
    slippage: '1',
    orientation: 'portrait',
    theme: 'dark',
    lockmode: 'none',
    pagecolor: null
  }

  private get root(): HTMLElement | null {
    return document.getElementById(XYFinaceWidget.rootId)
  }

  private get iframe(): HTMLElement | null {
    return document.getElementById(XYFinaceWidget.iframeId)
  }

  private get placeholder(): HTMLElement | null {
    return document.getElementById(XYFinaceWidget.placeholderId)
  }

  constructor() {
    ;(<any>window).onFrameLoad = () => {
      this.iframe!.style.display = 'block'
      this.placeholder!.remove()
      setTimeout(() => this.onViewportChange(true), 5000)
    }

    const fadeinAnimation = `
      <style>
        @keyframes fadein {
            0%   { opacity:1; }
            50%  { opacity:0.3; }
            100% { opacity:1; }
        }
      </style>
    `

    const rootStyles = `
      <style>
        #${XYFinaceWidget.rootId} {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
        }
      </style>
    `

    this.addStyle([fadeinAnimation, rootStyles])
  }

  private replaceAll(str: string, match: string, replacement: string) {
    function escapeRegExp(string: string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
    }

    return str.replace(new RegExp(escapeRegExp(match), 'g'), () => replacement)
  }

  public init(config: Config = this.config, initialize = true): void {
    if (!config) {
      config = this.config
    } else {
      this.checkConfig(config)
      this.config = config
    }
    const root = this.tryGetRoot()
    this.iframe?.remove()
    this.placeholder?.remove()

    setTimeout(() => {
      if (
        config &&
        initialize &&
        config.orientation !== 'portrait' &&
        config.orientation !== 'landscape'
      ) {
        this.disable()
        this.addViewportChangeListener()
        this.resizeObserver = new ResizeObserver(this.onResize.bind(this))
        this.resizeObserver.observe(root)
      }

      let { orientation, ...parameters } = config
      const type = this.getOrientation()
      this.orientation = type
      const device = window.innerWidth < 600 ? 'mobile' : 'desktop'
      parameters = {
        ...parameters,
        device
      } as any

      const query = this.replaceAll(
        queryString.stringify(parameters),
        '&',
        '&amp;'
      )

      const iframeNode = `
      <iframe
          id="xy-finance-iframe"
          title="XY-Finance Widget"
          height="${XYFinaceWidget.sizes[type].height}"
          width="${XYFinaceWidget.sizes[type].width}"
          src="${process.env.BASE_URL}/?orientation=${type}${
        query ? '&amp;' + query : ''
      }"
          onload="onFrameLoad()"
          allow="clipboard-read; clipboard-write; usb; bluetooth"
      >
      </iframe>
      `

      root.insertAdjacentHTML('afterbegin', iframeNode)
    })
  }

  public disable() {
    removeEventListener('DOMContentLoaded', this.onViewportChange, false)
    removeEventListener('load', this.onViewportChange, false)
    removeEventListener('scroll', this.onViewportChange, false)
    this.resizeObserver?.disconnect()
  }

  private onResize(): void {
    setTimeout(() => {
      if (
        this.config.orientation !== 'portrait' &&
        this.config.orientation !== 'landscape'
      ) {
        const rootWidth = this.root.getBoundingClientRect().width
        if (
          (this.orientation === 'portrait' &&
            rootWidth >= XYFinaceWidget.breakpoint) ||
          (this.orientation === 'landscape' &&
            rootWidth < XYFinaceWidget.breakpoint)
        ) {
          this.init(null, false)
        } else {
          setTimeout(this.onViewportChange)
        }
      }
    })
  }

  private getOrientation(): Orientation {
    const { orientation } = this.config
    let type: Orientation
    if (orientation === 'landscape' || orientation == 'portrait') {
      type = orientation
    } else {
      const positionInfo = this.root!.getBoundingClientRect()
      type =
        positionInfo.width < XYFinaceWidget.breakpoint
          ? 'portrait'
          : 'landscape'
    }

    return 'portrait'
  }

  private tryGetRoot(): HTMLElement {
    const root = this.root
    if (!root) {
      console.error(
        `[XYFINANCE WIDGET] You should place <div id="${XYFinaceWidget.rootId}"></div> into <body></body>`
      )
      throw new Error(
        `You should place <div id="${XYFinaceWidget.rootId}"></div> into <body></body>`
      )
    }

    return root
  }

  private addStyle(style: string | string[]) {
    if (Array.isArray(style)) {
      style.forEach((item) =>
        document.head.insertAdjacentHTML('beforeend', item)
      )
      return
    }
    document.head.insertAdjacentHTML('beforeend', style)
  }

  private addViewportChangeListener() {
    addEventListener('DOMContentLoaded', this.onViewportChange, false)
    addEventListener('load', this.onViewportChange, false)
    addEventListener('scroll', this.onViewportChange, false)
  }

  private onViewportChange = (force?: boolean | unknown) => {
    const root = this.tryGetRoot()
    const iframe = root.querySelector('iframe')
    if (!iframe || iframe?.style.display === 'none') {
      return
    }

    const isWidgetIntoViewport = XYFinaceWidget.isElementInViewport(iframe)
    if (this.isWidgetIntoViewport === isWidgetIntoViewport && force !== true) {
      return
    }

    this.isWidgetIntoViewport = isWidgetIntoViewport
    const msg = {
      name: 'widget-into-viewport',
      widgetIntoViewport: isWidgetIntoViewport
    }
    try {
      iframe.contentWindow.postMessage(
        msg,
        `https://${process.env.API_BASE_URL}`
      )
    } catch (e) {
      console.debug(e)
    }
  }

  private static isElementInViewport(element: HTMLElement) {
    const box = element.getBoundingClientRect()

    return (
      box.bottom > 0 &&
      box.right > 0 &&
      box.top < (window.innerHeight || document.documentElement.clientHeight) &&
      box.left < (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  private checkConfig(config: Config) {
    if (
      !config.fromTokenAddress ||
      !config.toTokenAddress ||
      !config.sourceChainId ||
      !config.targetChainId
    ) {
      console.error(
        '[XYFINANCE WIDGET] ERROR: you need to provide fromTokenAddress, toTokenAddress, sourceChainId, targetChainId'
      )
    }
  }
}
