import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useGenerateDedication } from '@workspace/api-client-react';
import {
  ArrowDown,
  Check,
  ChevronRight,
  Clipboard,
  Disc3,
  Feather,
  Heart,
  ImagePlus,
  Info,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Send,
  Share2,
  Sparkles,
  Sun,
  Volume2,
  WandSparkles,
  X,
} from 'lucide-react';

type Provider = 'auto' | 'groq' | 'gemini' | 'mistral';
type Tone = 'romantic' | 'leve' | 'poetic';
const MEMORY_KEY = 'presente-forro-memories';

const playlist = [
  { title: 'Anunciação', artist: 'Alceu Valença', duration: '03:57', color: '#f2bd5d' },
  { title: 'Colo de menina', artist: 'Falamansa', duration: '03:38', color: '#d66b75' },
  { title: 'Esperando na janela', artist: 'Gilberto Gil', duration: '04:14', color: '#76aaa2' },
  { title: 'Xote da alegria', artist: 'Falamansa', duration: '03:28', color: '#ed8c61' },
];

const providerLabels: Record<Provider, string> = {
  auto: 'Auto',
  groq: 'Groq',
  gemini: 'Gemini',
  mistral: 'Mistral',
};

const toneLabels: Record<Tone, string> = {
  leve: 'Leve e solar',
  romantic: 'Romântico',
  poetic: 'Poético',
};

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.5)] p-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
      <Info className="mt-0.5 size-4 shrink-0 text-[hsl(var(--accent))]" />
      <div>{children}</div>
    </div>
  );
}

function Home() {
  const [isOpened, setIsOpened] = useState(false);
  const [activeTrack, setActiveTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState('');
  const [dedication, setDedication] = useState<{ title: string; text: string } | null>(null);
  const [memories, setMemories] = useState<string[]>([]);
  const [newMemory, setNewMemory] = useState('');
  const [provider, setProvider] = useState<Provider>('auto');
  const [tone, setTone] = useState<Tone>('leve');
  const coverInputRef = useRef<HTMLInputElement>(null);
  const dedicationMutation = useGenerateDedication();

  useEffect(() => {
    if (!shareNotice) return;
    const timeout = window.setTimeout(() => setShareNotice(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [shareNotice]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MEMORY_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
          setMemories(parsed.slice(0, 12));
        }
      }
    } catch {
      setMemories([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(MEMORY_KEY, JSON.stringify(memories));
  }, [memories]);

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverImage(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const recipientName = String(values.get('recipientName') || '').trim();
    const senderName = String(values.get('senderName') || '').trim();
    const details = String(values.get('details') || '').trim();
    if (!recipientName) return;
    dedicationMutation.mutate(
      {
        data: {
          recipientName,
          senderName,
          tone,
          provider,
          details,
          memories,
        },
      },
      {
        onSuccess: (result) => {
          setDedication(result);
          window.setTimeout(() => document.getElementById('dedicacao-pronta')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
        },
      },
    );
  };

  const copyDedication = async () => {
    if (!dedication) return;
    await navigator.clipboard.writeText(`${dedication.title}\n\n${dedication.text}`);
    setShareNotice('Dedicação copiada para a área de transferência.');
  };

  const shareDedication = async () => {
    if (!dedication) return;
    const shareNavigator = navigator as Navigator & {
      share?: (data: { title: string; text: string }) => Promise<void>;
    };
    if (shareNavigator.share) {
      await shareNavigator.share({ title: dedication.title, text: dedication.text }).catch(() => undefined);
      return;
    }
    await copyDedication();
    setShareNotice('Seu navegador não abre a partilha; copiamos a dedicação para você.');
  };

  if (!isOpened) {
    return (
      <main className="noise relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[hsl(var(--background))] px-5 py-8">
        <div className="absolute left-[-8rem] top-[-8rem] size-[27rem] rounded-full bg-[hsl(var(--chart-3)/.15)] blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-7rem] size-[30rem] rounded-full bg-[hsl(var(--primary)/.13)] blur-3xl" />
        <div className="relative w-full max-w-[27rem]">
          <div className="mb-7 flex items-center justify-between px-1 text-[hsl(var(--muted-foreground))]">
            <span className="font-mono-brand text-[10px] uppercase tracking-[.25em]">um presente para guardar</span>
            <span className="flex items-center gap-1.5 font-mono-brand text-[10px] uppercase tracking-[.2em]">
              <span className="size-1.5 rounded-full bg-[hsl(var(--accent))]" /> 2025
            </span>
          </div>
          <section className="relative min-h-[min(76vh,38rem)] overflow-hidden rounded-[2rem] border border-[hsl(var(--border))] bg-[#24203d] p-7 shadow-[0_30px_90px_rgba(8,6,25,.5)]">
            <div className="absolute inset-0 opacity-80" style={{ background: 'radial-gradient(circle at 78% 20%, rgba(242,189,93,.2), transparent 24%), radial-gradient(circle at 10% 88%, rgba(214,107,117,.22), transparent 32%)' }} />
            <div className="absolute right-[-4rem] top-[-4rem] size-52 rounded-full border border-[hsl(var(--accent)/.35)]" />
            <div className="absolute right-[-2.5rem] top-[-2.5rem] size-32 rounded-full border border-[hsl(var(--accent)/.25)]" />
            <div className="absolute bottom-[-3.4rem] left-[-3.4rem] size-36 rotate-45 border border-[hsl(var(--primary)/.35)]" />
            <div className="relative flex min-h-[min(70vh,34rem)] flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-5 flex size-11 items-center justify-center rounded-full border border-[hsl(var(--accent)/.45)] text-[hsl(var(--accent))]">
                    <Music2 className="size-5" strokeWidth={1.5} />
                  </div>
                  <p className="font-mono-brand text-[10px] uppercase tracking-[.28em] text-[hsl(var(--accent))]">presente de</p>
                  <h1 className="mt-2 font-display text-5xl leading-[.93] text-[hsl(var(--foreground))]">Forró</h1>
                </div>
                <div className="pt-1 text-right">
                  <p className="font-display text-2xl italic leading-none text-[hsl(var(--foreground)/.85)]">para você</p>
                  <p className="mt-2 font-mono-brand text-[9px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">com carinho</p>
                </div>
              </div>
              <div>
                <div className="mb-7 flex items-end gap-1.5" aria-hidden="true">
                  {[18, 32, 50, 25, 43, 62, 34, 22, 44, 29, 56, 38, 20, 48].map((height, index) => (
                    <span key={index} className="w-1 rounded-full bg-[hsl(var(--primary)/.8)]" style={{ height }} />
                  ))}
                </div>
                <p className="max-w-[18rem] font-display text-3xl leading-[1.02] text-[hsl(var(--foreground))]">Uma noite, uma dança, um tanto de nós.</p>
                <button
                  type="button"
                  onClick={() => setIsOpened(true)}
                  data-testid="button-open-present"
                  className="mt-8 flex w-full items-center justify-between rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform duration-300 hover:scale-[1.02] active:scale-[.98]"
                >
                  <span>Entrar na lembrança</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-[hsl(var(--primary-foreground)/.14)]"><ChevronRight className="size-4" /></span>
                </button>
              </div>
            </div>
          </section>
          <p className="mt-6 text-center font-mono-brand text-[10px] uppercase tracking-[.17em] text-[hsl(var(--muted-foreground))]">toque para abrir com calma</p>
        </div>
      </main>
    );
  }

  return (
    <main className="noise min-h-[100dvh] overflow-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pb-3 pt-6 sm:px-8 lg:px-12">
        <button type="button" onClick={() => setIsOpened(false)} data-testid="button-close-present" className="group flex items-center gap-2 text-left">
          <span className="flex size-9 items-center justify-center rounded-full border border-[hsl(var(--border))] text-[hsl(var(--accent))] transition-colors group-hover:border-[hsl(var(--accent)/.6)]"><Heart className="size-4" fill="currentColor" /></span>
          <span className="hidden font-mono-brand text-[10px] uppercase tracking-[.22em] text-[hsl(var(--muted-foreground))] sm:block">Presente de Forró</span>
        </button>
        <div className="flex items-center gap-2 font-mono-brand text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">
          <span className="size-1.5 rounded-full bg-[hsl(var(--primary))]" /> uma lembrança viva
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:gap-20 lg:px-12 lg:pb-28 lg:pt-20">
        <div className="reveal-up order-2 lg:order-1">
          <p className="font-mono-brand text-[10px] uppercase tracking-[.3em] text-[hsl(var(--primary))]">uma carta em movimento</p>
          <h2 className="mt-5 max-w-xl font-display text-6xl leading-[.9] text-[hsl(var(--foreground))] sm:text-8xl">Para quem faz a vida <em className="text-[hsl(var(--accent))]">dançar.</em></h2>
          <p className="mt-7 max-w-md text-[15px] leading-7 text-[hsl(var(--muted-foreground))]">Porque há pessoas que chegam e mudam o compasso da casa. Esta é uma pequena noite feita de música, memória e carinho para você.</p>
          <div className="mt-9 flex items-center gap-4">
            <button type="button" onClick={() => document.getElementById('carta')?.scrollIntoView({ behavior: 'smooth' })} data-testid="button-read-letter" className="flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]">
              Ler a carta <ArrowDown className="size-4" />
            </button>
            <span className="font-mono-brand text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">deslize devagar</span>
          </div>
        </div>
        <div className="reveal-up-delay order-1 lg:order-2">
          <div className="relative mx-auto aspect-[.88] max-w-[28rem] rotate-2 rounded-[1.6rem] border border-[hsl(var(--accent)/.45)] bg-[#302a4d] p-3 shadow-[0_28px_80px_rgba(7,5,22,.5)] transition-transform duration-500 hover:rotate-0">
            <div className="relative flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-[hsl(var(--foreground)/.12)]" style={coverImage ? { backgroundImage: `linear-gradient(180deg, rgba(22,18,45,.05), rgba(22,18,45,.82)), url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              {!coverImage && <div className="absolute inset-0" style={{ background: 'linear-gradient(140deg, #3d3156 0%, #24203d 48%, #8d4d55 100%)' }} />}
              <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 68% 25%, rgba(242,189,93,.55) 0 1px, transparent 2px), radial-gradient(circle at 32% 38%, rgba(251,241,221,.4) 0 1px, transparent 2px), radial-gradient(circle at 77% 65%, rgba(251,241,221,.35) 0 1px, transparent 2px)', backgroundSize: '90px 90px, 130px 130px, 170px 170px' }} />
              {!coverImage && <div className="float-slow absolute bottom-[19%] left-[22%] h-40 w-28 rounded-[50%] border-2 border-[hsl(var(--accent)/.7)] border-b-transparent border-l-transparent" />}
              <div className="relative flex h-full flex-col justify-between p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono-brand text-[9px] uppercase tracking-[.22em] text-[hsl(var(--foreground)/.72)]">capa da nossa história</span>
                  <Disc3 className="size-5 text-[hsl(var(--accent))]" />
                </div>
                <div>
                  {!coverImage && <p className="mb-4 max-w-[12rem] font-mono-brand text-[9px] uppercase leading-5 tracking-[.15em] text-[hsl(var(--foreground)/.6)]">um espaço reservado para a foto que faz este presente ser só de vocês</p>}
                  <h3 className="font-display text-5xl leading-[.88] text-[hsl(var(--foreground))] sm:text-6xl">Noite de<br /><i className="text-[hsl(var(--accent))]">forró</i></h3>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => coverInputRef.current?.click()} data-testid="button-replace-cover" className="absolute -bottom-4 -right-4 flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/.5)] bg-[hsl(var(--card))] px-3.5 py-2.5 text-[11px] font-bold text-[hsl(var(--foreground))] shadow-xl transition-transform hover:scale-105">
              <ImagePlus className="size-4 text-[hsl(var(--accent))]" /> Trocar capa
            </button>
            <input ref={coverInputRef} onChange={handleCoverChange} data-testid="input-cover-image" className="hidden" type="file" accept="image/*" />
          </div>
        </div>
      </section>

      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--card)/.52)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[.78fr_1.22fr] lg:gap-20 lg:px-12 lg:py-24">
          <div>
            <div className="mb-5 flex items-center gap-3 text-[hsl(var(--accent))]"><span className="h-px w-10 bg-[hsl(var(--accent))]" /><span className="font-mono-brand text-[10px] uppercase tracking-[.25em]">lado A</span></div>
            <h2 className="max-w-sm font-display text-5xl leading-[.92] text-[hsl(var(--foreground))] sm:text-6xl">A trilha sonora de uma noite bonita.</h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Dê o play e deixe cada faixa lembrar um detalhe: um passo, uma risada, o calor de estar perto.</p>
            <div className="mt-8 flex items-center gap-3 text-[hsl(var(--muted-foreground))]"><Volume2 className="size-4 text-[hsl(var(--primary))]" /><span className="font-mono-brand text-[10px] uppercase tracking-[.14em]">playlist curada para dançar juntinho</span></div>
          </div>
          <div className="space-y-2">
            {playlist.map((track, index) => {
              const isActive = activeTrack === index;
              return (
                <button
                  key={track.title}
                  type="button"
                  onClick={() => { setActiveTrack(index); setIsPlaying(true); }}
                  data-testid={`button-track-${index}`}
                  className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${isActive ? 'border-[hsl(var(--primary)/.55)] bg-[hsl(var(--primary)/.1)]' : 'border-transparent hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary)/.5)]'}`}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${track.color}22`, color: track.color }}>
                    {isActive && isPlaying ? <Pause className="size-4" fill="currentColor" /> : <Play className="ml-0.5 size-4" fill="currentColor" />}
                  </span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-[hsl(var(--foreground))]">{track.title}</span><span className="mt-1 block truncate text-xs text-[hsl(var(--muted-foreground))]">{track.artist}</span></span>
                  <span className="font-mono-brand text-[10px] text-[hsl(var(--muted-foreground))]">{track.duration}</span>
                  {isActive && <span className="hidden items-end gap-0.5 sm:flex" aria-label="faixa selecionada">{[10, 16, 7, 13].map((height, barIndex) => <span key={barIndex} className="w-0.5 rounded-full bg-[hsl(var(--primary))]" style={{ height }} />)}</span>}
                </button>
              );
            })}
            <div className="mt-5 flex items-center gap-3 px-4">
              <span className="font-mono-brand text-[10px] text-[hsl(var(--muted-foreground))]">00:00</span><div className="h-1 flex-1 overflow-hidden rounded-full bg-[hsl(var(--border))]"><div className={`h-full rounded-full bg-[hsl(var(--primary))] transition-all ${isPlaying ? 'w-[42%]' : 'w-0'}`} /></div><span className="font-mono-brand text-[10px] text-[hsl(var(--muted-foreground))]">{playlist[activeTrack].duration}</span>
            </div>
            <p className="px-4 pt-2 text-[11px] text-[hsl(var(--muted-foreground))]">A música toca quando você escolher a versão final deste presente.</p>
          </div>
        </div>
      </section>

      <section id="carta" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_.8fr] lg:gap-24">
          <article className="reveal-up">
            <div className="mb-7 flex items-center gap-3 text-[hsl(var(--primary))]"><Feather className="size-4" /><span className="font-mono-brand text-[10px] uppercase tracking-[.25em]">uma carta sem pressa</span></div>
            <p className="font-display text-4xl leading-[1.05] text-[hsl(var(--foreground))] sm:text-5xl">“Tem gente que não entra na nossa vida. <span className="text-[hsl(var(--accent))]">Entra no ritmo.</span>”</p>
            <div className="mt-9 max-w-xl space-y-5 text-[15px] leading-8 text-[hsl(var(--muted-foreground))]">
              <p>Você tem esse jeito raro de transformar qualquer sala em encontro. Um passo seu, e o mundo parece caber melhor: mais leve, mais quente, mais cheio de vontade de ficar.</p>
              <p>Que nunca falte uma música boa, um chão para girar e alguém que reconheça a beleza de te ver sendo inteira — dançando, cuidando, inventando caminhos.</p>
              <p>Este presente é só um jeito de dizer: eu vejo tudo isso. E gosto imensamente de estar por perto.</p>
            </div>
            <div className="mt-10 flex items-center gap-3"><span className="h-px w-12 bg-[hsl(var(--primary))]" /><span className="font-display text-2xl italic text-[hsl(var(--foreground))]">com todo meu carinho</span></div>
          </article>
          <aside className="reveal-up-delay self-end rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.55)] p-6 sm:p-8">
            <div className="mb-7 flex items-center justify-between"><span className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">um lugar especial</span><Sun className="size-5 text-[hsl(var(--accent))]" /></div>
            <h3 className="font-display text-4xl leading-none text-[hsl(var(--foreground))]">Para a mãe que ensina o amor a ter passos.</h3>
            <p className="mt-5 text-sm leading-6 text-[hsl(var(--muted-foreground))]">E para a filha que aprendeu, olhando para ela, que força também pode ser delicada.</p>
            <div className="mt-7 h-px bg-[hsl(var(--border))]" />
            <p className="mt-5 text-xs leading-6 text-[hsl(var(--muted-foreground))]">Com respeito e admiração pela história que vocês constroem juntas, todos os dias.</p>
          </aside>
        </div>
      </section>

      <section className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
            <div>
              <div className="mb-5 flex items-center gap-3 text-[hsl(var(--accent))]"><Sparkles className="size-4" /><span className="font-mono-brand text-[10px] uppercase tracking-[.25em]">último detalhe</span></div>
              <h2 className="font-display text-5xl leading-[.91] text-[hsl(var(--foreground))] sm:text-6xl">Escreva algo que pareça <em className="text-[hsl(var(--primary))]">vocês.</em></h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">A inteligência ajuda com as palavras. A memória é sua. Conte um detalhe pequeno e deixe o resto nascer.</p>
              <Note>Você pode escolher o provedor de inteligência artificial. “Auto” escolhe a melhor opção disponível para este momento.</Note>
            </div>
            <form onSubmit={handleGenerate} className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--background)/.65)] p-5 sm:p-8">
              <div className="mb-7 rounded-2xl border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.06)] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">memória pessoal</p>
                    <h3 className="mt-2 font-display text-3xl leading-none text-[hsl(var(--foreground))]">Coisas que ela quer guardar</h3>
                  </div>
                  <Heart className="mt-1 size-4 shrink-0 text-[hsl(var(--primary))]" fill="currentColor" />
                </div>
                <p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Salvas somente neste dispositivo para a IA lembrar do jeito dela, sem precisar repetir tudo.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {memories.map((memory) => (
                    <span key={memory} className="inline-flex max-w-full items-center gap-2 rounded-full border border-[hsl(var(--accent)/.3)] bg-[hsl(var(--card)/.7)] px-3 py-2 text-xs text-[hsl(var(--foreground))]">
                      <span className="max-w-[15rem] truncate">{memory}</span>
                      <button type="button" onClick={() => setMemories((current) => current.filter((item) => item !== memory))} aria-label={`Remover memória: ${memory}`} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">×</button>
                    </span>
                  ))}
                  {!memories.length && <span className="text-xs italic text-[hsl(var(--muted-foreground))]">Ainda não há memórias salvas.</span>}
                </div>
                <div className="mt-4 flex gap-2">
                  <input value={newMemory} onChange={(event) => setNewMemory(event.target.value)} maxLength={180} data-testid="input-memory" className="min-w-0 flex-1 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2.5 text-xs text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]" placeholder="Ex.: sua música favorita" />
                  <button type="button" onClick={() => { const memory = newMemory.trim(); if (!memory || memories.length >= 12 || memories.includes(memory)) return; setMemories((current) => [...current, memory]); setNewMemory(''); }} disabled={memories.length >= 12} data-testid="button-add-memory" className="shrink-0 rounded-xl border border-[hsl(var(--accent)/.5)] px-3 text-xs font-bold text-[hsl(var(--accent))] transition-colors hover:bg-[hsl(var(--accent)/.1)] disabled:opacity-40">Guardar</button>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]"><Info className="size-3" /> Não guarde documentos, endereços ou informações íntimas de crianças.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block font-mono-brand text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">nome dela</span><input name="recipientName" required maxLength={80} defaultValue="Maria" data-testid="input-recipient-name" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-[hsl(var(--foreground))] outline-none transition-colors placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))]" placeholder="Como ela gosta de ser chamada" /></label>
                <label className="block"><span className="mb-2 block font-mono-brand text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">seu nome</span><input name="senderName" maxLength={80} defaultValue="" data-testid="input-sender-name" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-[hsl(var(--foreground))] outline-none transition-colors placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))]" placeholder="Assine no final, se quiser" /></label>
              </div>
              <label className="mt-5 block"><span className="mb-2 block font-mono-brand text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">um detalhe só de vocês</span><textarea name="details" maxLength={600} data-testid="input-dedication-details" className="min-h-32 w-full resize-y rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-3 text-sm leading-6 text-[hsl(var(--foreground))] outline-none transition-colors placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))]" placeholder="Uma dança, uma viagem, o jeito que ela ri, algo que você deseja para ela..." /></label>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <fieldset><legend className="mb-2 font-mono-brand text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">tom da mensagem</legend><div className="flex flex-wrap gap-2">{(Object.keys(toneLabels) as Tone[]).map((item) => <button type="button" key={item} onClick={() => setTone(item)} data-testid={`button-tone-${item}`} className={`rounded-full border px-3 py-2 text-xs transition-colors ${tone === item ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.15)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>{toneLabels[item]}</button>)}</div></fieldset>
                <fieldset><legend className="mb-2 font-mono-brand text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">inteligência por trás</legend><select value={provider} onChange={(event) => setProvider(event.target.value as Provider)} data-testid="select-ai-provider" className="w-full appearance-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2.5 text-xs text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]">{(Object.keys(providerLabels) as Provider[]).map((item) => <option key={item} value={item}>{providerLabels[item]}</option>)}</select></fieldset>
              </div>
              <button disabled={dedicationMutation.isPending} type="submit" data-testid="button-generate-dedication" className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.01] disabled:cursor-wait disabled:opacity-65">
                {dedicationMutation.isPending ? <><span className="size-4 animate-pulse rounded-full border-2 border-[hsl(var(--primary-foreground)/.35)] border-t-[hsl(var(--primary-foreground))]" /> encontrando as palavras...</> : <><WandSparkles className="size-4" /> Criar minha dedicação</>}
              </button>
              {dedicationMutation.isError && <div role="alert" data-testid="status-dedication-error" className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--destructive)/.45)] bg-[hsl(var(--destructive)/.08)] p-3 text-xs text-[hsl(var(--destructive))]"><span>Não conseguimos criar agora. Tente outra vez em um instante.</span><button type="button" onClick={() => dedicationMutation.reset()} data-testid="button-dismiss-error" aria-label="Fechar aviso"><X className="size-4" /></button></div>}
            </form>
          </div>
        </div>
      </section>

      {dedication && (
        <section id="dedicacao-pronta" className="border-t border-[hsl(var(--accent)/.3)] bg-[hsl(var(--primary)/.07)]">
          <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono-brand text-[10px] uppercase tracking-[.25em] text-[hsl(var(--accent))]">feito para ela</p><h2 className="mt-3 font-display text-5xl leading-none text-[hsl(var(--foreground))]">Sua dedicação</h2></div><div className="flex gap-2"><button type="button" onClick={copyDedication} data-testid="button-copy-dedication" className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--accent))]"><Clipboard className="size-4 text-[hsl(var(--accent))]" /> Copiar</button><button type="button" onClick={shareDedication} data-testid="button-share-dedication" className="flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--accent-foreground))] transition-transform hover:scale-[1.02]"><Share2 className="size-4" /> Partilhar</button></div></div>
            <article className="relative overflow-hidden rounded-[1.5rem] border border-[hsl(var(--accent)/.35)] bg-[#302a4d] p-7 shadow-[0_20px_60px_rgba(10,7,30,.35)] sm:p-12"><div className="absolute -right-8 -top-8 size-36 rounded-full border border-[hsl(var(--accent)/.3)]" /><div className="relative"><div className="mb-9 flex items-center gap-3"><Heart className="size-4 text-[hsl(var(--primary))]" fill="currentColor" /><span className="font-mono-brand text-[10px] uppercase tracking-[.22em] text-[hsl(var(--muted-foreground))]">uma palavra para guardar</span></div><h3 data-testid="text-dedication-title" className="font-display text-4xl italic leading-none text-[hsl(var(--accent))] sm:text-5xl">{dedication.title}</h3><p data-testid="text-dedication-content" className="mt-7 max-w-2xl whitespace-pre-line text-[15px] leading-8 text-[hsl(var(--foreground)/.86)]">{dedication.text}</p><div className="mt-10 flex items-center gap-2 text-[hsl(var(--muted-foreground))]"><span className="h-px w-8 bg-[hsl(var(--primary))]" /><span className="font-mono-brand text-[10px] uppercase tracking-[.15em]">feito com presença</span></div></div></article>
            {shareNotice && <div role="status" data-testid="status-share-notice" className="mt-4 flex items-center gap-2 text-xs text-[hsl(var(--accent))]"><Check className="size-4" /> {shareNotice}</div>}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><button type="button" onClick={() => setDedication(null)} data-testid="button-new-dedication" className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"><RotateCcw className="size-3.5" /> Criar outra versão</button><span className="flex items-center gap-2 font-mono-brand text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]"><Send className="size-3.5 text-[hsl(var(--primary))]" /> pronta para ser enviada</span></div>
          </div>
        </section>
      )}

      <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p className="font-display text-2xl italic text-[hsl(var(--foreground)/.8)]">Que a vida te encontre dançando.</p>
        <p className="font-mono-brand text-[9px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">feito à mão, com carinho</p>
      </footer>
    </main>
  );
}

export default Home;