import 'failure.dart';

/// Sucesso ou [Failure], como valor. O `switch` exaustivo obriga quem consome
/// a tratar o erro — diferente de exceção, que dá para esquecer.
sealed class Result<T> {
  const Result();
}

final class Ok<T> extends Result<T> {
  const Ok(this.value);

  final T value;
}

final class Err<T> extends Result<T> {
  const Err(this.failure);

  final Failure failure;
}
