export function CodeMessages() {
    return <div className="p-1  mx-2 text-sm">
        <div className="max-w-[400px] flex flex-col gap-y-3">
            <div className="my-1">
                Mesajların içerisine aşağıdaki parametreleri yerleştirebilirsiniz.
            </div>
            <div className="my-1">
                <div className="">
                    - @Client = Müşteri adı soyadı
                </div>
                <div className="">
                    - @Date = Rezervasyon Tarih/Saati
                </div>
                <div className="">
                    - @Person = Rezervasyon Kişi Sayısı
                </div>
                <div className="">
                    - @Link = Ödeme Linki
                </div>
                <div className="">
                    - @Restaurant = Restoran adı
                </div>
            </div>
            <div className="">

                Örnek Mesaj:
                Sayın @Client" @Restaurant için @Date tarihli @Person kişilik rezervasyon kaydınız alınmıştır. Rezervasyonu onaylamak için @Link adresine giderek ödeme yapmanız gerekmektedir.
            </div>
            <div className="">
                Örnek Mesaj Çıktısı:
                Sayın Aslı Gümüş; 24 Kasım 2024 Cuma saat 22:30 için 2 kişilik rezervasyon kaydınız alınmıştır. Rezervasyonu onaylamak için http://bit.ly/af3a63b adresine giderek provizyon ödemesi yapmanız gerekmektedir.
            </div>

        </div>
    </div>
}