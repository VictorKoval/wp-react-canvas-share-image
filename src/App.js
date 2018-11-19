import React, {Component} from 'react';
import axios from 'axios';
import logo from './share-logo.png';
import logo2 from './share-logo2.png';
import placeholder from './placeholder.png';

export default class ImageUpload extends Component {

    constructor(props) {
        super(props);
        this.state = {
            img: null,
            ctx: null,
            logo: null,
            logo2: null,
            style: 'style3',
            shareTextChanged: false
        };
        this.form = null;
        this.submitButton = null;
        this.canvas = React.createRef();
        this.text = React.createRef();

        this.config = {childList: true, subtree: true};
        this.observer = new MutationObserver(this.callbackObserver);
    }

    callbackObserver = (mutationsList, observer) => {
        let add_value = '-1';
        let remove_value = '-1';
        for (let mutation of mutationsList) {
            for (let node of mutation.addedNodes) {
                if ('getAttribute' in node && node.getAttribute('id') === '_thumbnail_id' && node.getAttribute('value') !== '-1') {
                    add_value = node.getAttribute('value');
                }
            }
            for (let removedNode of mutation.removedNodes) {
                if ('getAttribute' in removedNode && removedNode.getAttribute('id') === '_thumbnail_id' && removedNode.getAttribute('value') !== '-1') {
                    remove_value = removedNode.getAttribute('value');
                }
            }
        }

        if (add_value !== '-1' && add_value !== remove_value) {
            this.generateFromImage_2();
        }
    };

    saveGeneratedToServer = () => {
        const {nonce} = this.props;
        this.canvas.current.toBlob((img) => {
            const data = new FormData();

            data.append('async-upload', img, "share.png");
            data.append('name', "share");
            data.append('_wpnonce', nonce);
            data.append('action', 'upload-attachment');

            axios.post('/wp-admin/async-upload.php', data)
                .then((response) => {
                    document.getElementById("share_img_id").value = response.data.data.id;
                    this.submitButton.click();
                });
        });


    };

    componentDidMount() {
        let targetNode = document.getElementById('postimagediv');

        this.observer.observe(targetNode, this.config);

        let ctx = this.canvas.current.getContext('2d');
        ctx.canvas.width = 1;
        ctx.canvas.height = 1;
        this.setState({ctx: ctx});

        let image = new Image();
        let image2 = new Image();
        image.onload = () => {
            this.setState({logo: image});
        };
        image2.onload = () => {
            this.setState({logo2: image2});
        };
        image.src = logo;
        image2.src = logo2;
        this.form = document.getElementById('post');
        this.submitButton = document.getElementById('publish');
        this.form.onsubmit = this.formSubmitAction;
        if (this.props.shareImgSet) {
            this.generateFromURL(this.props.shareImgURL);
        }
    }

    componentWillUnmount() {
        this.observer.disconnect();
    }

    formSubmitAction = (e) => {
        if (this.state.shareImageChanged) {
            e.preventDefault();
            this.setState({
                shareImageChanged: false
            }, this.saveGeneratedToServer());
            return false;
        } else {
            return true;
        }
    };

    generateFromURL = (url) => {
        let img = new Image();

        img.onload = () => {
            this.setState({img: img}, this.drawImage)
        };

        img.src = url;
    };

    generateFromImage = () => {
        this.setState({
            shareImageChanged: true
        });

        this.style = 'style1';
        let img = new Image();

        img.onload = () => {
            this.setState({img: img}, this.drawText_style1)
        };

        this.getTitleFromPost();

        let thumb_anchor = document.getElementById("set-post-thumbnail");
        let thumbs = thumb_anchor.getElementsByTagName("img");

        if (thumbs.length === 0) return;

        let thumbSrc = thumbs[0].getAttribute("src");

        if (thumbSrc === undefined) return;

        img.src = thumbSrc;
    };

    generateFromImage_2 = () => {
        this.setState({
            shareImageChanged: true
        });

        this.style = 'style3';
        let img = new Image();

        img.onload = () => {
            this.setState({img: img}, this.drawText_style3)
        };

        this.getTitleFromPost();

        let thumb_anchor = document.getElementById("set-post-thumbnail");
        let thumbs = thumb_anchor.getElementsByTagName("img");

        if (thumbs.length === 0) return;

        let thumbSrc = thumbs[0].getAttribute("src");

        if (thumbSrc === undefined) return;

        img.src = thumbSrc;
    };

    getTitleFromPost = () => {
        if (this.state.shareTextChanged) return;
        let title_el = document.getElementById("title");
        let text = title_el.value.toUpperCase();
        this.text.current.value = text;
        this.setState({text: text});
    };

    generateFromPlaceholder = () => {
        this.setState({
            shareImageChanged: true
        });

        this.style = 'style2';
        let img = new Image();

        img.onload = () => {
            this.setState({img: img}, this.drawText_style2)
        };

        this.getTitleFromPost();

        img.src = placeholder;
    };

    generateFromUpload = (e) => {
        this.setState({
            shareImageChanged: true
        });

        this.style = 'style2';
        e.persist();
        e.preventDefault();

        let file = e.target.files[0];
        let reader = new FileReader();
        let img = new Image();

        img.onload = () => {
            this.setState({img: img}, this.drawText_style2)
        };

        reader.onloadend = () => {
            img.src = reader.result;
        };
        this.getTitleFromPost();
        reader.readAsDataURL(file);
    };

    removeShareImg = () => {
        document.getElementById("share_img_id").value = '';
        this.setState({
            shareImageChanged: false
        });
        const {ctx} = this.state;
        ctx.canvas.width = 1;
        ctx.canvas.height = 1;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };

    onShareTextChange = (e) => {
        e.persist();
        e.preventDefault();

        let text = e.target.value;
        this.setState({
            text: text,
            shareTextChanged: true,
        }, () => {
            if (this.style === 'style1') {
                this.drawText_style1();
                return;
            }
            if (this.style === 'style2') {
                this.drawText_style2();
                return;
            }
            if (this.style === 'style3') {
                this.drawText_style3();
            }
        });
    };

    drawImage = () => {
        const {img, ctx} = this.state;
        if (img === null) return;
        let dw = 600;
        let dh = 315;
        let w = img.width;
        let h = img.height;
        let sh = h * dw / w;
        let x = 0;
        let y = (dh - sh) / 2;
        ctx.canvas.width = dw;
        ctx.canvas.height = dh;
        ctx.drawImage(img, x, y, dw, sh);
    };

    drawLogo = () => {
        const {logo, ctx} = this.state;
        if (logo === null) return;
        let dw = 42;
        let dh = 31;
        let y = 10;
        let x = ctx.canvas.width - dw - 15;
        ctx.drawImage(logo, x, y, dw, dh);
    };

    drawLogo_2 = (top, left) => {
        const {logo2, ctx} = this.state;
        if (logo2 === null) return;
        let dw = 42;
        let dh = 31;
        let y = top - dh;
        let x = left;
        ctx.drawImage(logo2, x, y, dw, dh);
    };

    drawText_style1 = () => {
        this.drawImage();
        this.drawLogo();
        const {text} = this.state;
        if (text === undefined || text === null || text === '') return;

        const fontSize = 13;
        const lineHeight = 20;
        const paddingLeft = 35;
        const paddingRight = 20;
        const paddingTop = 10;
        const paddingBottom = 10;
        const marginBottom = 10;

        let ctx = this.canvas.current.getContext('2d');
        ctx.font = fontSize + "px ProximaNova-Semibold";
        ctx.textAlign = "left";

        let lines = this.genTextArr(ctx, text, ctx.canvas.width - (paddingLeft + paddingRight));
        let contentH = lines.length * lineHeight;
        let offset = ctx.canvas.height - (contentH + paddingBottom + marginBottom);

        ctx.fillStyle = 'rgba(0,0,0,0.451)';
        ctx.fillRect(0, offset - (lineHeight - fontSize), ctx.canvas.width, contentH + paddingTop + paddingBottom);

        ctx.fillStyle = 'white';
        ctx.fillRect(18, offset + (lineHeight - fontSize) / 2, 4, contentH);

        for (let n = lines.length - 1; n >= 0; n--) {
            ctx.fillText(lines[n], paddingLeft, offset + ((n + 1) * lineHeight));
        }

    }

    drawText_style2 = () => {
        this.drawImage();
        const {text} = this.state;
        if (text === undefined || text === null || text === '') return;

        const lineHeight = 25;
        const paddingLeft = 65;
        const paddingRight = 20;

        let ctx = this.canvas.current.getContext('2d');
        ctx.font = "16px ProximaNova-Bold";
        ctx.textAlign = "left";
        ctx.fillStyle = '#000000';

        let lines = this.genTextArr(ctx, text, ctx.canvas.width - (paddingLeft + paddingRight));
        let contentH = lines.length * lineHeight;
        let offset = (ctx.canvas.height - contentH) / 2;
        for (let n = lines.length - 1; n >= 0; n--) {
            ctx.fillText(lines[n], paddingLeft, offset + ((n + 1) * lineHeight));
        }
    }

    drawText_style3 = () => {
        this.drawImage();

        const {text} = this.state;
        if (text === undefined || text === null || text === '') return;

        const fontSize = 22;
        const lineHeight = 30;
        const paddingLeft = 20;
        const paddingRight = 20;
        const paddingTop = 10;
        const paddingBottom = 15;

        let ctx = this.canvas.current.getContext('2d');
        ctx.canvas.style.letterSpacing = '2px';
        ctx.font = fontSize + "px ProximaNova-Bold";
        ctx.textAlign = "left";

        let lines = this.genTextArr(ctx, text, ctx.canvas.width - (paddingLeft + paddingRight));
        let contentH = lines.length * lineHeight;
        let offset = ctx.canvas.height - (contentH + paddingBottom);

        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = 'white';

        for (let n = lines.length - 1; n >= 0; n--) {
            ctx.fillText(lines[n], paddingLeft, offset + ((n + 1) * lineHeight));
        }
        this.drawLogo_2(offset - paddingTop, paddingLeft);
    };

    genTextArr = (context, text, maxWidth) => {
        let words = text.split(' ');
        let line = [''];
        let i = 0;

        for (let n = 0; n < words.length; n++) {
            let testLine = (line[i] === undefined ? '' : line[i]) + ' ' + words[n];
            let metrics = context.measureText(testLine);
            let testWidth = metrics.width;
            let spacer = (i === 0 && n === 0) ? '' : ' ';
            if (testWidth > maxWidth && n > 0) {
                spacer = '';
                i += 1;
            }
            line[i] = (line[i] === undefined ? '' : line[i]) + spacer + words[n];
        }
        return line;
    };

    render() {
        return (
            <>
                <input type="button" style={{fontFamily: "ProximaNova-Bold"}} onClick={this.generateFromImage_2}
                       value="Зображення запису 1"/>
                <input type="button" onClick={this.generateFromImage} value="Зображення запису 2"/>
                <input type="button" onClick={this.generateFromPlaceholder} value="Стандартне"/><br/>
                Завантажити: <input type="file" onChange={this.generateFromUpload}/><br/>
                <canvas ref={this.canvas}/>
                <br/>
                <input style={{width: '100%'}} onChange={(e) => this.onShareTextChange(e)} ref={this.text}/><br/>
                <input type="button" onClick={this.removeShareImg} value="Очистити"/>
            </>
        )
    }
}