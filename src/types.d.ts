// Declare missing types for type checking

declare module "react-obfuscate" {
    import React from 'react';

    interface ObfuscateProps {
        email?: string
    }

    declare const Obfuscate: React.SFC<ObfuscateProps>
    export default Obfuscate
}