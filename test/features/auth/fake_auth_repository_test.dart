import 'package:flutter_test/flutter_test.dart';
import 'package:linker_front/core/app_origin.dart';
import 'package:linker_front/core/error/failure.dart';
import 'package:linker_front/core/error/result.dart';
import 'package:linker_front/features/auth/data/fake_auth_repository.dart';
import 'package:linker_front/features/auth/domain/session.dart';

void main() {
  late FakeAuthRepository repository;

  setUp(() => repository = FakeAuthRepository(latency: Duration.zero));

  test('autentica com a senha de demonstração e guarda a origem', () async {
    final result = await repository.signIn(
      email: 'Maria.Souza@Empresa.com',
      password: '123456',
      origin: AppOrigin.web,
    );

    expect(result, isA<Ok<Session>>());
    final session = (result as Ok<Session>).value;
    expect(session.email, 'maria.souza@empresa.com');
    expect(session.name, 'Maria Souza');
    expect(session.origin, AppOrigin.web);
  });

  test('devolve credencial inválida quando a senha não confere', () async {
    final result = await repository.signIn(
      email: 'a@b.com',
      password: 'errada',
      origin: AppOrigin.mobile,
    );

    expect(result, isA<Err<Session>>());
    expect((result as Err<Session>).failure, isA<InvalidCredentialsFailure>());
  });

  test('simula falha de rede no e-mail reservado', () async {
    final result = await repository.signIn(
      email: 'offline@linker.com',
      password: '123456',
      origin: AppOrigin.mobile,
    );

    expect((result as Err<Session>).failure, isA<NetworkFailure>());
  });

  test(
    'restoreSession devolve null antes do login e a sessão depois',
    () async {
      expect(await repository.restoreSession(), isNull);

      await repository.signIn(
        email: 'a@b.com',
        password: '123456',
        origin: AppOrigin.mobile,
      );
      expect(await repository.restoreSession(), isNotNull);

      await repository.signOut();
      expect(await repository.restoreSession(), isNull);
    },
  );
}
