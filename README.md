# XY-Finance-widget

![alt text](https://github.com/XY-Finance/xy-finance-widget/blob/9b84e902ac635d4f43834d2db92e6693a6fc6f65/src/assets/example.png "")


## Get Started

1. Paste this code as high in the `<head>` of the page as possible

```
<script defer type="text/javascript" src="https://widget.xy.finance/js/bundle.min.js"></script> 
```

2. Paste this `<div>` tag to the place where you need widget to display in body

```
<div id="xy-finance-widget-root"></div>
```

3. Paste this `<script>` in the bottom of body

```
<script defer>
  setTimeout(() => {
    // set default config
    const config = {
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

    // use widget
    xyFinanceWidget.init(config);
  }, 2000)
</script>
```

## Configuration

| Key              | Type   | Default |
| ---------------- | ------ | ------- |
| fromTokenAddress | String | '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' |
| sourceChainId    | String | '1' |
| toTokenAddress   | String | '0x77777777772cf0455fB38eE0e75f38034dFa50DE' |
| targetChainId    | String | '1' |
| amount           | Number | 1   |
| slippage         | String | '1' |
| orientation      | `portrait` or `landscape` For now, only support `portrait` | `portrait` |
| theme            | `dark` or `light` | `dark` |
| lockmode         | `none` or `both` or `fromToken` or `toToken` | `none` |
| pagecolor        | String or null Only use HexColor without # | null |
