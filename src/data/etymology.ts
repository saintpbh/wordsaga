
export interface Root {
    id: string;
    root: string;
    meaning: string;
    description: string;
}

export interface Artifact {
    id: string;
    prefix: string;
    meaning: string;
}

export interface Discovery {
    targetWord: string;
    rootId: string;
    artifactId: string;
    meaning: string;
    description: string;
}

export const ROOTS: Root[] = [
    { id: 'r_port', root: 'PORT', meaning: 'Carry', description: 'To carry or bear' },
    { id: 'r_ject', root: 'JECT', meaning: 'Throw', description: 'To throw' },
    { id: 'r_form', root: 'FORM', meaning: 'Shape', description: 'To shape or mold' },
];

export const ARTIFACTS: Artifact[] = [
    { id: 'a_im', prefix: 'IM-', meaning: 'In / Into' },
    { id: 'a_ex', prefix: 'EX-', meaning: 'Out' },
    { id: 'a_trans', prefix: 'TRANS-', meaning: 'Across' },
    { id: 'a_re', prefix: 'RE-', meaning: 'Back / Again' },
    { id: 'a_de', prefix: 'DE-', meaning: 'Down / Away' },
];

export const DISCOVERIES: Discovery[] = [
    { targetWord: 'Import', rootId: 'r_port', artifactId: 'a_im', meaning: '수입하다', description: 'Carry In (Bring goods into a country)' },
    { targetWord: 'Export', rootId: 'r_port', artifactId: 'a_ex', meaning: '수출하다', description: 'Carry Out (Send goods to another country)' },
    { targetWord: 'Transport', rootId: 'r_port', artifactId: 'a_trans', meaning: '수송하다', description: 'Carry Across (Move from one place to another)' },
    { targetWord: 'Inject', rootId: 'r_ject', artifactId: 'a_im', meaning: '주입하다', description: 'Throw In (Force fluid into)' },
    { targetWord: 'Reject', rootId: 'r_ject', artifactId: 'a_re', meaning: '거절하다', description: 'Throw Back (Refuse to accept)' },
    { targetWord: 'Reform', rootId: 'r_form', artifactId: 'a_re', meaning: '개혁하다', description: 'Shape Again (Make changes to improve)' },
    { targetWord: 'Deform', rootId: 'r_form', artifactId: 'a_de', meaning: '변형시키다', description: 'Shape Down (Distort the shape)' },
];
