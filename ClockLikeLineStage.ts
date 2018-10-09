const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
const getAngles = (h, m) => {
    const ha = 360/12
    const ma = 360/60
    return [Math.floor(h * ha) + (ma/60) * ha, ma *m]
}
class ClockLikeLineStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage = new ClockLikeLineStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0

    update(cb : Function) {
        this.scale += 0.05 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }

}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class CLLNode {
    next : CLLNode
    prev : CLLNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new CLLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap = w / (nodes + 1)
        const weightFactors = [30, 60]
        const lengthFactors = [4, 2]
        context.strokeStyle = '#BDBDBD'
        const angles = getAngles(4, 30)
        context.save()
        context.translate(gap * this.i + gap, h/2)
        for (var j = 0; j < 2; j++) {
            const sc = Math.min(0.5, Math.max(this.state.scale - 0.5 * j, 0)) * 2
            context.lineCap = 'round'
            context.lineWidth = Math.min(w, h) / weightFactors[j]
            context.save()
            context.rotate(angles[j] * Math.PI/180 * sc)
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(0, -gap/lengthFactors[j])
            context.stroke()
            context.restore()
        }
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : CLLNode {
        var curr : CLLNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class ClockLikeLine {
    root : CLLNode = new CLLNode(0)
    curr : CLLNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }

}
