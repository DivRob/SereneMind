import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Check Your Email</CardTitle>
            <CardDescription className="text-slate-600">We've sent you a verification link</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 leading-relaxed">
              Please check your email and click the verification link to activate your account. Once verified, you can
              start your wellness journey!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
