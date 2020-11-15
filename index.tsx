import React from 'react';

interface INavigator extends Navigator {
    serial: any
}

const Printer = () => {

    async function connectSerial() {

        const navegador = navigator as INavigator;

        if (!navegador.serial) {
            console.warn('Serial não suportado');
            return;
        }

        navegador.serial.addEventListener("connect", (event: any) => {
            // TODO: Automatically open event.port or warn user a port is available.
            console.log(`Serial conectado `, event);
        });

        navegador.serial.addEventListener("disconnect", (event: any) => {
            // TODO: Remove |event.port| from the UI.
            // If the serial port was opened, a stream error would be observed as well.
            console.log(`Serial disconnect `, event);
        });

        try {
            const port = await navegador.serial.requestPort({ usbProductId: 3, usbVendorId: 2843 });

            const info = port.getInfo();

            console.log(` info = `, info);

            try {
                const openResult = await port.open({ baudRate: 115200 });

                console.log(` openResult =`, openResult)
                console.log(` port =`, port)
            } catch (error) {
                console.error(`baudrate invalido`, error);
            }

            try {
                const signals = await port.getSignals();
                console.log(` signals = `, signals);
            } catch (error) {
                console.error(` error = `, error);
            }

            if (port.readable === null && port.writable === null) {
                console.log(`Cannot connect`);
                return;
            }
            console.log(` port.writable =`, port.writable)

            reader(port).then(reader1 => { }, error => { });

            write(port).then(res => { }, error => { })


        } catch (error) {
            console.log(` error = `, error);
        }
    }

    async function reader(port: any) {
        const reader2 = port.readable.getReader();

        // Listen to data coming from the serial device.
        while (true) {
            const { value, done } = await reader2.read();
            if (done) {
                // Allow the serial port to be closed later.
                reader2.releaseLock();
                break;
            }
            // value is a Uint8Array.
            console.log(value);
        }
    }

    async function write(port: any) {
        //Write
        try {
            const encoder = new TextEncoder();

            const textEncoder = new TextEncoderStream();

            console.log(` encode `, textEncoder.encoding);

            console.log(` port.encoding `, port.encoding);
            port.encoding = 'Cp850';
            console.log(` port.encoding `, port.encoding);

            const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);

            const writer = textEncoder.writable.getWriter();

            await content().forEach(async cont => {
                await writer.write(cont);
            });

            //Finish
            await writableStreamClosed.catch(() => { /* Ignore the error */ });

            //writer.close();
            await writableStreamClosed;

            await port.close();


        } catch (error) {
            console.error(` error write`, error);
        }
    }

    function content() {
        const esc = '\x1B'; //ESC byte in hex notation
        const newLine = '\x0A'; //LF byte in hex notation

        var order = [
            esc + '\x40',                                          // Inicializo o documento
            '\x10' + '\x14' + '\x01' + '\x00' + '\x05',               // É dado um pulso para iniciar a impressão
            esc + '\x61' + '\x31',                                 // Defino o alinhamento ao centro


            esc + '\x74' + '\x10',
            newLine + newLine,                                          // Quebra de linha

            'Pedido Nº LVE182422' + newLine,                  // Imprimo número do pedido
            newLine,                                                   // Quebra de linha


            esc + '\x45' + '\x0D',                                 // Ativo negrito
            'SEU PEDIDO' + newLine + newLine,                           // Imprimo título
            esc + '\x45\n',                                        // Desativo negrito


            newLine,
            esc + '\x61' + '\x30',                                 // Defino o alinhamento a esquerda


            esc + '\x45' + '\x0D',                                 // Ativo negrito
            'Cliente: Hugo' + newLine + newLine,                        // Imprimo nome do cliente
            'Telefone: (83) 98805-0131' + newLine + newLine,            // Imprimo telefone
            esc + '\x45\n',                                        // Desativo negrito


            // Imprimo linha tracejada
            '----------------------------------------------' + newLine + newLine,


            "Macaxeira                          (1) R$ 2,94\n\n",   // Imprimo o produto
            "Alface Crespa                      (1) R$ 2,50\n\n",   // Imprimo o produto
            "Coentro                            (1) R$ 2,50\n\n",   // Imprimo o produto
            "Banana pacovan                     (1) R$ 5,00\n\n",   // Imprimo o produto
            "Batata doce                        (1) R$ 3,80\n\n",   // Imprimo o produto
            "Salsa                              (1) R$ 3,00\n\n",   // Imprimo o produto
            "Manjericão                         (1) R$ 2,21\n\n",   // Imprimo o produto
            "Abacaxi                            (2) R$ 7,60\n\n",   // Imprimo o produto
            "Goma de tapioca 1kg                (1) R$ 6,00\n\n",   // Imprimo o produto
            "Tomate Cereja 500 gramas           (1) R$ 5,00\n\n",   // Imprimo o produto
            "Mamão havaí                        (1) R$ 4,00\n\n",   // Imprimo o produto


            // Imprimo linha tracejada
            '------------------------------------------------' + newLine + newLine,


            'Subtotal                              R$ 44,55' + newLine,               // Imprimo subtotal
            'Desconto                               R$ 0,00\n' + newLine + newLine,    // Imprimo desconto
            'Entrega                                 Grátis\n' + newLine + newLine,    // Imprimo entrega


            // Imprimo linha tracejada
            '----------------------------------------------' + newLine + newLine,


            esc + '\x21' + '\x30',                                                  // Ativo modo em
            'Total           R$ 44,55' + newLine,                                       // Imprimo o total do pedido
            esc + '\x21' + newLine + esc + '\x45' + newLine + newLine,              // Desativo modo em


            // Imprimo linha tracejada
            '----------------------------------------------' + newLine + newLine,


            esc + '\x45' + '\x0D',                                 // Ativo negrito
            'Forma de pagamento Cartão online' + newLine + newLine,     // Imprimo o tipo de pagamento
            'MasterCard - Crédito' + newLine + newLine,                 // Imprimo nome do cartão
            esc + '\x45\n',                                        // Desativo negrito


            newLine + newLine,                                          // Quebra de linha


            'Entregar em 29/11/2018' + newLine + newLine,               // Imprimo data de entrega
            'Rua Bananeiras, 999' + newLine,                           // Imprimo endereço
            'Manaíra, João Pessoa' + newLine,                          // Imprimo bairro e cidade
            '58038-170' + newLine + newLine,                            // Imprimo cep


            newLine + newLine,
            esc + '\x61' + '\x31',                                 // Defino o alinhamento ao centro
            'NÃO É DOCUMENTO FISCAL' + newLine + newLine,               // Imprimo observação


            newLine,
            esc + '\x69',                                          // Corto o papel
            '\x10' + '\x14' + '\x01' + '\x00' + '\x05',               // Dou um pulso
        ];
        return order;
    }

    return (
        <div className="main-content-container px-4 container-fluid home" id="HomePage">

            <div className="mb-2 row">
                <div className="col-lg-12">
                    <span className="d-block mb-2 text-muted">
                        <strong>Imprimir</strong>
                    </span>
                </div>
                <div className="mb-4 col">
                    <div className="bg-primary text-white text-center rounded p-3 cursor-pointer" onClick={connectSerial}>
                        Clique para testar
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Printer;