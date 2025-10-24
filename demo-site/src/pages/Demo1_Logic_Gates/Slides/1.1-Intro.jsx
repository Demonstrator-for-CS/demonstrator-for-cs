import Or from "../Images/or_gate.png"
import And from "../Images/and_gate.png"
import Xor from "../Images/xor_gate.png"
import Not from "../Images/not_gate.png"

export default function Intro() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-6">
            <p className="text-2xl text-slate-900 font-semibold max-w-2xl animate-fade-in">
                The four basic gates that build circuits:
            </p>

            <div className="flex flex-row items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-2 animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                    <p className="text-xl font-semibold text-purple-600">OR</p>
                    <img className="img-fluid" src={Or} alt="OR Gate" />
                </div>
                <div className="flex flex-col items-center gap-2 animate-slide-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                    <p className="text-xl font-semibold text-blue-600">AND</p>
                    <img className="img-fluid" src={And} alt="AND Gate" />
                </div>
                <div className="flex flex-col items-center gap-2 animate-slide-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                    <p className="text-xl font-semibold text-orange-600">XOR</p>
                    <img className="img-fluid" src={Xor} alt="XOR Gate" />
                </div>
                <div className="flex flex-col items-center gap-2 animate-slide-up opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                    <p className="text-xl font-semibold text-red-600">NOT</p>
                    <img className="img-fluid" src={Not} alt="NOT Gate" />
                </div>
            </div>

            <p className="text-2xl text-slate-900 font-semibold max-w-2xl animate-fade-in opacity-0" style={{ animationDelay: '3.0s', animationFillMode: 'forwards' }}>
                These gates take input(s) via signals delivered through wires.
                The input(s) can either be <span className="text-green-400 font-bold">on</span> (represented by the number 1)
                or <span className="text-red-500 font-bold">off</span> (represented by the number 0).
            </p>
        </div>
    );
}
