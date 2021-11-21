import id128 from 'id128'

export function ulid () {
  return id128.Ulid.generate().toCanonical()
}

export function ulidMonotonic () {
  return id128.UlidMonotonic.generate().toCanonical()
}

export function uuid4 () {
  return id128.Uuid4.generate().toCanonical()
}

export function uuid6 () {
  return id128.Uuid6.generate().toCanonical()
}

export function ulidUuid () {
  return id128.Uuid.fromRawTrusted(id128.Ulid.generate().toRaw()).toCanonical()
}

export function ulidMonotonicUuid () {
  return id128.Uuid.fromRawTrusted(
    id128.UlidMonotonic.generate().toRaw()
  ).toCanonical()
}
